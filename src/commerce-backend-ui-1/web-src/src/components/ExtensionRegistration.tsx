import { register } from '@adobe/uix-guest';
import { useEffect } from 'react';

import type { AppProps } from '../types';
import { MainPage } from './MainPage';

// TODO: Replace with your unique extension ID
const EXTENSION_ID = 'sample';

export default function ExtensionRegistration({ ims, runtime }: AppProps) {
    const registerExtension = async () => {
        await register({
            id: EXTENSION_ID,
            methods: {},
        });
    };

    useEffect(() => {
        registerExtension().catch(console.error);
    }, []);

    return <MainPage ims={ims} runtime={runtime} />;
}
