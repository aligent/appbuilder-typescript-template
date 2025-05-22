import { type Runtime } from '@adobe/exc-app';
import { useCallback, useEffect, useState } from 'react';
import { mockIms, mockRuntime, RuntimeManager, type Ims } from '../runtime/RuntimeManager';

/**
 * React hook to use the Adobe runtime if it is available, or mocks if not
 *
 * @returns - The runtime and ims
 *
 * @example
 *
 * const { loading, runtime, ims } = useAdobeRuntime();
 *
 * runtime.on('configuration', ({ imsOrg, imsToken, locale }) => {
 *     console.log('configuration change', { imsOrg, imsToken, locale });
 * });
 *
 * return (
 *     <div>
 *         {loading && <div>Loading Adobe Runtime...</div>}
 *         {error && <div>Error loading Adobe Runtime: {error.message}</div>}
 *         {runtime && <div>Adobe Runtime loaded</div>}
 *         {ims && <div>IMS loaded</div>}
 *     </div>
 * )
 */
export function useAdobeRuntime() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [runtime, setRuntime] = useState<Runtime>(mockRuntime);
    const [ims, setIms] = useState<Ims>(mockIms);

    const load = useCallback(async () => {
        try {
            const runtimeScript = new RuntimeManager('Aligent AppBuilder Typescript Template');

            if (!runtimeScript.loadUrl()) {
                throw new Error('Module Runtime: Could not load valid Runtime Script url');
            }

            if (!(await runtimeScript.attachToDocument())) {
                throw new Error('Module Runtime: Failed to attach to document');
            }

            const { runtime, ims } = await runtimeScript.initialise();

            setRuntime(runtime);
            setIms(ims);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return { loading, error, runtime, ims };
}
