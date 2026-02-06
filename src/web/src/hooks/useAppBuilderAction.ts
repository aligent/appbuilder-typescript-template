import { useEffect, useRef, useState } from 'react';

import {
    useLazyAppBuilderAction,
    type UseLazyAppBuilderActionOptions,
} from '@/web/hooks/useLazyAppBuilderAction';

/**
 * A React hook for invoking App Builder actions with built-in state management. The hook invokes the action
 * immediately on mount.
 *
 * This hook provides a convenient way to call registered App Builder actions with automatic handling of loading states,
 * errors, and response data. It supports Adobe IMS authentication and allows configuration at both initialization and
 * invocation time.

 * @example
 * ```tsx
 * // Invoke immediately on mount to fetch initial data
 * const { response, loading } = useAppBuilderAction<ConfigData>({
 *   name: 'getConfig',
 *   method: 'GET',
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
export function useAppBuilderAction<T = unknown>(options: UseLazyAppBuilderActionOptions) {
    const [loading, setLoading] = useState<boolean>(true);

    const hasInvokedRef = useRef<boolean>(false);

    const { response, loading: isInvoking, error, invoke } = useLazyAppBuilderAction<T>(options);

    // This `useEffect` triggers `invoke` immediately on render. A use case for this is querying for a
    // previously-set value to pre-populate the config forms as the app renders.
    useEffect(() => {
        if (hasInvokedRef.current) {
            return;
        }

        invoke();
        hasInvokedRef.current = true;
    }, [invoke]);

    // Match the loading state in this hook with the `useLazyAppBuilderAction` loading state, after the action completes.
    useEffect(() => {
        if (!hasInvokedRef.current) {
            return;
        }

        setLoading(isInvoking);
    }, [isInvoking]);

    return { response, loading, error };
}
