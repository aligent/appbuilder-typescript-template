import { useCallback, useState } from 'react';

import ActionRegistry from '@/web/config.json';

export interface UseAppBuilderActionOptions {
    name: keyof typeof ActionRegistry;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    searchParams?: Record<string, string>;
    body?: object;
    headers?: Record<string, string>;
    ims?: { token?: string; org?: string };
}

export interface ActionPayload {
    searchParams?: Record<string, string>;
    body?: object;
    headers?: Record<string, string>;
}

export function useAppBuilderAction<T = unknown>(options: UseAppBuilderActionOptions) {
    const [response, setResponse] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const invoke = useCallback(
        async (invokeOptions?: ActionPayload) => {
            setLoading(true);
            setError(null);
            setResponse(null);
            try {
                const headers = new Headers({
                    'content-type': 'application/json',
                    // If provided, set the default authentication headers
                    // They can still be overriden by custom headers when setting up
                    // or invoking the hook
                    ...(options.ims?.org && { 'x-gw-ims-org-id': options.ims.org }),
                    ...(options.ims?.token && { Authorization: `Bearer ${options.ims.token}` }),
                    ...options.headers,
                    ...invokeOptions?.headers,
                });

                const url = new URL(ActionRegistry[options.name]);
                const allSearchParams = { ...options.searchParams, ...invokeOptions?.searchParams };
                for (const [k, v] of Object.entries(allSearchParams)) {
                    if (v != null) url.searchParams.set(k, v);
                }

                const fetchOptions: RequestInit = {
                    method: options.method || 'GET',
                    headers,
                };

                if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
                    const body = invokeOptions?.body || options.body;
                    if (body) fetchOptions.body = JSON.stringify(body);
                }

                const response = await fetch(url.toString(), fetchOptions);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

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

    return { response, loading, error, invoke };
}
