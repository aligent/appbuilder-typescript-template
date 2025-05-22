import { defaultTheme, Grid, Provider, View } from '@adobe/react-spectrum';
import { Route, Routes, useNavigate } from 'react-router';
import { useAdobeRuntime } from '../hooks/useAdobeRuntime.ts';
import { Documentation } from './Documentation.tsx';
import { Home } from './Home.tsx';
import { SampleAction } from './SampleAction.tsx';
import SideBar from './SideBar.tsx';

function App() {
    const { loading, ims } = useAdobeRuntime();

    const navigate = useNavigate();
    return (
        <Provider
            theme={defaultTheme}
            colorScheme={'light'}
            router={{
                navigate,
            }}
        >
            {loading && <div>Loading Adobe Runtime...</div>}
            {!loading && (
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
                            <Route path="/sample-action" element={<SampleAction ims={ims} />} />
                            <Route path="/documentation" element={<Documentation />} />
                        </Routes>
                    </View>
                </Grid>
            )}
        </Provider>
    );
}

export default App;
