import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Runtime, { init } from '@adobe/exc-app';
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/App';
import './index.css';
import type { AIORuntime, IMSContext } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).React = React;

/* Here you can bootstrap your application and configure the integration with the Adobe Experience Cloud Shell */
const isLocalhost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

try {
    // attempt to load the Experience Cloud Runtime
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./exc-runtime');
    // if there are no errors, bootstrap the app in the Experience Cloud Shell
    init(bootstrapInExcShell);
} catch (e: unknown) {
    if (!isLocalhost) {
        console.error('application not running in Adobe Experience Cloud Shell', e);
    } else {
        console.log(
            'Standalone mode: Adobe Experience Cloud Shell not detected (expected on localhost).'
        );
    }
    // fallback mode, run the application without the Experience Cloud Runtime
    bootstrapRaw();
}

function renderApp(runtime: AIORuntime, ims: IMSContext) {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        throw new Error('Root element not found');
    }
    const client = createRoot(rootElement);
    client.render(<App ims={ims} runtime={runtime} />);
}

function bootstrapRaw() {
    /* **here you can mock the exc runtime and ims objects** */
    const mockRuntime: AIORuntime = {
        on: () => {
            // NOOP
        },
    };
    renderApp(mockRuntime, {});
}

function bootstrapInExcShell() {
    // get the Experience Cloud Runtime object
    const runtime = Runtime() as AIORuntime;

    // use this to set a favicon
    // runtime.favicon = 'url-to-favicon'

    // use this to respond to clicks on the app-bar title
    // runtime.heroClick = () => window.alert('Did I ever tell you you\'re my hero?')

    // ready event brings in authentication/user info
    runtime.on(
        'ready',
        ({
            imsOrg,
            imsToken,
            imsProfile,
        }: {
            imsOrg: string;
            imsToken: string;
            imsProfile: unknown;
            locale: string;
        }) => {
            // tell the exc-runtime object we are done
            runtime.done?.();
            console.log('Ready! received imsProfile:', imsProfile);
            const ims: IMSContext = {
                profile: imsProfile,
                org: imsOrg,
                token: imsToken,
            };
            renderApp(runtime, ims);
        }
    );

    // set solution info, shortTitle is used when window is too small to display full title
    // TODO: Update with your extension's title and icon
    runtime.solution = {
        icon: 'AdobeExperienceCloud',
        title: 'My Extension',
        shortTitle: 'ME',
    };
    runtime.title = 'My Extension';
}
