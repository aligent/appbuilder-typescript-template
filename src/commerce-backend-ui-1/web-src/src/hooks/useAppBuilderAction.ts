import { useMemo } from 'react';

import {
    useLazyAppBuilderAction,
    type UseLazyAppBuilderActionOptions,
} from './useLazyAppBuilderAction';

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
    const { response, loading, error, invoke } = useLazyAppBuilderAction<T>(options);

    // Invoke once on mount. useMemo ensures invoke is called only once
    // during the initial render, avoiding setState-in-effect issues.
    useMemo(() => {
        invoke();
    }, [invoke]);

    return { response, loading: loading || response === null, error };
}
