import { Runtime } from '@adobe/exc-app';
import { createContext, useContext, useEffect, useState } from 'react';

import { RuntimeScript, type Ims } from '@/web/runtime/RuntimeScript';
import { mockIms, mockRuntime } from '@/web/runtime/runtimeMocks';

const AdobeRuntimeContext = createContext<AdobeRuntimeContextType>({
    loading: true,
    error: null,
    runtime: mockRuntime,
    ims: mockIms,
});

interface AdobeRuntimeContextType {
    loading: boolean;
    error: Error | null;
    runtime: Runtime;
    ims: Ims;
}

/**
 * Provides the Adobe runtime and IMS context to the application
 */
export const AdobeRuntimeContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [runtime, setRuntime] = useState<Runtime>(mockRuntime);
    const [ims, setIms] = useState<Ims>(mockIms);

    useEffect(() => {
        const load = async () => {
            try {
                const runtimeScript = new RuntimeScript();

                if (!runtimeScript.isInIframe()) {
                    throw new Error('Module Runtime: Only available within an iframe');
                }

                if (!runtimeScript.getUrl()) {
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
        };

        load();
    }, []);

    return (
        <AdobeRuntimeContext value={{ loading, error, runtime, ims }}>
            {children}
        </AdobeRuntimeContext>
    );
};

/**
 * React hook to use the Adobe runtime and IMS context
 *
 * @returns {AdobeRuntimeContextType} - The Adobe runtime and IMS context
 *
 * @default loading - true
 * @default error - null
 * @default runtime - mockRuntime
 * @default ims - mockIms
 */
export const useAdobeRuntimeContext = () => {
    const context = useContext(AdobeRuntimeContext);
    if (!context) {
        throw new Error('AdobeRuntimeContext not found');
    }
    return context;
};
