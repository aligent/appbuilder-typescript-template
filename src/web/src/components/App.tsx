import { defaultTheme, Grid, Provider, View } from '@adobe/react-spectrum';
import { Route, Routes, useNavigate } from 'react-router';
import { Documentation } from './Documentation.tsx';
import { Home } from './Home.tsx';
import { SampleAction } from './SampleAction.tsx';
import SideBar from './SideBar.tsx';

function App(props: {
    runtime: { on: (event: string, callback: (data: Record<string, unknown>) => void) => void };
    ims: { token: string; org: string };
}) {
    // use exc runtime event handlers
    // respond to configuration change events (e.g. user switches org)
    props.runtime.on('configuration', ({ imsOrg, imsToken, locale }) => {
        console.log('configuration change', { imsOrg, imsToken, locale });
    });
    // respond to history change events
    props.runtime.on('history', ({ type, path }) => {
        console.log('history change', { type, path });
    });

    const navigate = useNavigate();
    return (
        <Provider
            theme={defaultTheme}
            colorScheme={'light'}
            router={{
                navigate,
            }}
        >
            <Grid
                areas={['sidebar content']}
                columns={['256px', '3fr']}
                rows={['auto']}
                height="100vh"
                gap="size-100"
            >
                <View gridArea="sidebar" backgroundColor="gray-200" padding="size-200">
                    <SideBar></SideBar>
                </View>
                <View gridArea="content" padding="size-200">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/sample-action" element={<SampleAction ims={props.ims} />} />
                        <Route path="/documentation" element={<Documentation />} />
                    </Routes>
                </View>
            </Grid>
        </Provider>
    );
}

export default App;
