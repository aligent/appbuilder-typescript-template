import { lightTheme, Provider, ToastContainer } from '@adobe/react-spectrum';
import type { ErrorInfo } from 'react';
import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';
import { HashRouter, Route, Routes } from 'react-router';
import type { AppProps } from '../types';
import ExtensionRegistration from './ExtensionRegistration';

function App({ ims, runtime }: AppProps) {
    useEffect(() => {
        const onConfiguration = ({ imsOrg }: { imsOrg: string; imsToken: string }) => {
            console.log('configuration change', { imsOrg });
        };
        const onHistory = ({ type, path }: { type: string; path: string }) => {
            console.log('history change', { type, path });
        };
        runtime.on('configuration', onConfiguration);
        runtime.on('history', onHistory);
    }, [runtime]);

    return (
        <ErrorBoundary FallbackComponent={FallbackComponent} onError={onError}>
            <HashRouter>
                <Provider colorScheme={'light'} theme={lightTheme}>
                    <ToastContainer />
                    <Routes>
                        <Route
                            element={<ExtensionRegistration ims={ims} runtime={runtime} />}
                            index
                        />
                    </Routes>
                </Provider>
            </HashRouter>
        </ErrorBoundary>
    );
}

function onError(error: unknown, info: ErrorInfo) {
    console.error('Error rendering UI', error, info.componentStack);
}

function FallbackComponent({ error }: FallbackProps) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
        <>
            <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Something went wrong :(</h1>
            <pre>{message}</pre>
        </>
    );
}

export default App;
