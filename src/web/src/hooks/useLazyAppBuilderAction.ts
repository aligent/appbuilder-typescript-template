import { useCallback, useEffect, useRef, useState } from 'react';

import ActionRegistry from '@/config.json';

/**
 * Payload options that can be passed when invoking an action.
 * These values merge with and override the options set during hook initialization.
 */
export interface ActionPayload {
    /**
     * URL search parameters to append to the action URL
     */
    searchParams?: Record<string, string>;

    /**
     * Request body for non-GET/HEAD requests
     */
    body?: object;

    /**
     * Custom headers to include in the request
     */
    headers?: Record<string, string>;
}

/**
 * Configuration options for the useAppBuilderAction hook.
 *
 * {@link ActionPayload}'s `searchParams`, `body`, and `headers` can be set here as default values, but can also be
 * passed in when calling `invoke()` if we want to override the default values.
 */
export type UseLazyAppBuilderActionOptions = ActionPayload & {
    /**
     * The name of the action to invoke. This must be a key from the action registry in `@/web/config.json`.
     */
    name: keyof typeof ActionRegistry;

    /**
     * HTTP method to use for the request.
     * @default 'GET'
     */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

    /**
     * Adobe IMS authentication credentials
     */
    ims?: {
        /**
         * IMS bearer token for authorization
         */
        token?: string;

        /**
         * IMS organization ID
         */
        org?: string;
    };

    /**
     * Setting this to `true` calls the action immediately, on render. A use case for this is querying for a
     * previously-set value to pre-populate the config forms as the app renders.
     * @default false
     */
    shouldInvokeOnInitialisation?: boolean;
};

/**
 * A React hook for invoking App Builder actions with built-in state management.
 *
 * This hook provides a convenient way to call registered App Builder actions with automatic handling of loading states,
 * errors, and response data. It supports Adobe IMS authentication and allows configuration at both initialization and
 * invocation time.
 *
 * The hook can optionally invoke the action immediately on mount by setting `shouldInvokeOnInitialisation` to `true`.
 * This is useful for fetching initial data to pre-populate forms or display cached values when the component renders.
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { response, loading, error, invoke } = useAppBuilderAction<MyDataType>({
 *   name: 'myAction',
 *   method: 'GET',
 * });
 *
 * // Invoke the action
 * await invoke();
 *
 * // With runtime parameters
 * await invoke({
 *   searchParams: { id: '123' },
 *   body: { data: 'value' },
 * });
 * ```
 *
 * @example
 * ```tsx
 * // With IMS authentication
 * const { invoke } = useAppBuilderAction({
 *   name: 'protectedAction',
 *   method: 'POST',
 *   ims: {
 *     token: imsToken,
 *     org: imsOrg,
 *   },
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Invoke immediately on mount to fetch initial data
 * const { response, loading } = useAppBuilderAction<ConfigData>({
 *   name: 'getConfig',
 *   method: 'GET',
 *   shouldInvokeOnInitialisation: true,
 * });
 *
 * // `loading` starts as `true`, and `response` will be populated once the action completes
 * if (loading) {
 *   return <Spinner />;
 * }
 *
 * return <ConfigForm initialValues={response} />;
 * ```
 */
export function useLazyAppBuilderAction<T = unknown>(options: UseLazyAppBuilderActionOptions) {
    const { shouldInvokeOnInitialisation = false } = options;

    const [response, setResponse] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(!!shouldInvokeOnInitialisation);
    const [error, setError] = useState<string | null>(null);

    const hasInvokedOnInitialisationRef = useRef<boolean>(false);

    /**
     * Invokes the configured App Builder action. Optional {@link ActionPayload} can be passed in to override the
     * default values that were set when initialising the `useAppBuilderAction` hook.
     */
    const invoke = useCallback(
        async (invokeOptions?: ActionPayload) => {
            setLoading(true);
            setError(null);
            setResponse(null);

            try {
                // Build headers with content-type, IMS auth, and custom headers
                // Priority: content-type < IMS headers < initial headers < invoke headers
                const headers = new Headers({
                    'content-type': 'application/json',
                    ...(options.ims?.org && { 'x-gw-ims-org-id': options.ims.org }),
                    ...(options.ims?.token && { Authorization: `Bearer ${options.ims.token}` }),
                    ...options.headers,
                    ...invokeOptions?.headers,
                });

                // Construct the URL from the action registry and merge search params
                const url = new URL(ActionRegistry[options.name]);
                const allSearchParams = { ...options.searchParams, ...invokeOptions?.searchParams };
                for (const [k, v] of Object.entries(allSearchParams)) {
                    if (v != null) url.searchParams.set(k, v);
                }

                // Configure fetch options
                const fetchOptions: RequestInit = {
                    method: options.method || 'GET',
                    headers,
                };

                // Attach body for non-GET/HEAD requests
                if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
                    const body = invokeOptions?.body || options.body;
                    if (body) fetchOptions.body = JSON.stringify(body);
                }

                // Execute the request
                const response = await fetch(url.toString(), fetchOptions);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                // Parse and store the response
                const data = await response.json();
                setResponse(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        },
        [options]
    );

    // This `useEffect` triggers `invoke` immediately on render if `shouldInvokeOnInitialisation` is `true`.
    // A use case for this is querying for a previously-set value to pre-populate the config forms as the app renders.
    useEffect(() => {
        if (!shouldInvokeOnInitialisation || hasInvokedOnInitialisationRef.current) {
            return;
        }

        invoke();
        hasInvokedOnInitialisationRef.current = true;
    }, [invoke, shouldInvokeOnInitialisation]);

    return { response, loading, error, invoke };
}
