import {
    ActionButton,
    Flex,
    Heading,
    InlineAlert,
    ProgressCircle,
    Text,
    Well,
} from '@adobe/react-spectrum';

import { useImsAuth } from '../hooks/useImsAuth';
import { useLazyAppBuilderAction } from '../hooks/useLazyAppBuilderAction';
import type { AppProps } from '../types';

// Example: Uncomment useAppBuilderAction to fetch data on mount
// import { useAppBuilderAction } from '../hooks/useAppBuilderAction';

export const MainPage = ({ ims }: AppProps) => {
    const { imsToken, imsOrgId, isInitialized } = useImsAuth(ims);

    // ── Example: Invoke an action on button click ────────────────────
    // useLazyAppBuilderAction lets you call an action on demand.
    // The 'name' must match a key in config.json (auto-generated at build).
    const {
        response,
        loading: actionLoading,
        error: actionError,
        invoke,
    } = useLazyAppBuilderAction<{ message: string }>({
        name: 'admin-ui-sdk/registration',
        method: 'GET',
        ims: { token: imsToken ?? undefined, org: imsOrgId ?? undefined },
    });

    // ── Example: Fetch data automatically on mount ───────────────────
    // Uncomment below to load data as soon as the page renders:
    //
    // const { response: config, loading: configLoading } = useAppBuilderAction<{ enabled: boolean }>({
    //     name: 'my-package/get-config',
    //     method: 'GET',
    //     ims: { token: imsToken ?? undefined, org: imsOrgId ?? undefined },
    // });

    if (!isInitialized) {
        return (
            <Flex height="100vh" alignItems="center" justifyContent="center">
                <ProgressCircle aria-label="Initializing" isIndeterminate />
            </Flex>
        );
    }

    return (
        <Flex
            direction="column"
            height="100vh"
            UNSAFE_style={{
                boxSizing: 'border-box',
                padding: 'var(--spectrum-global-dimension-size-300)',
            }}
            gap="size-200"
        >
            <Heading level={1}>Welcome to your App Builder Extension</Heading>
            <Text>
                IMS Auth: {imsToken ? 'Authenticated' : 'Not authenticated'}
                {imsOrgId && ` | Org: ${imsOrgId}`}
            </Text>

            {/* Example: Button that invokes an action */}
            <ActionButton onPress={() => invoke()} isDisabled={actionLoading}>
                {actionLoading ? 'Loading...' : 'Test Action'}
            </ActionButton>

            {actionError && <InlineAlert variant="negative">{actionError}</InlineAlert>}

            {response && (
                <Well>
                    <Text>
                        <pre>{JSON.stringify(response, null, 2)}</pre>
                    </Text>
                </Well>
            )}
        </Flex>
    );
};
