import { attach } from '@adobe/uix-guest';
import { useEffect, useState } from 'react';

import type { IMSContext } from '../types';

const EXTENSION_ID = 'sample';

interface UseImsAuthReturn {
    imsToken: string | null;
    imsOrgId: string | null;
    isInitialized: boolean;
}

export function useImsAuth(ims?: IMSContext): UseImsAuthReturn {
    const [imsToken, setImsToken] = useState<string | null>(null);
    const [imsOrgId, setImsOrgId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (ims?.token) {
                    setImsToken(ims.token);
                    setImsOrgId(ims.org ?? null);
                } else {
                    const guestConnection = await attach({ id: EXTENSION_ID });
                    const context = guestConnection?.sharedContext;
                    setImsToken(context?.get('imsToken') ?? null);
                    setImsOrgId(context?.get('imsOrgId') ?? null);
                }
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : 'Unknown error';
                console.warn('Running in standalone mode - IMS context not available:', message);
            } finally {
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, [ims]);

    return { imsToken, imsOrgId, isInitialized };
}
