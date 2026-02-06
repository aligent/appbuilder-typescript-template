import { defaultTheme, Grid, Provider, View } from '@adobe/react-spectrum';
import { Route, Routes, useNavigate } from 'react-router';

import { Documentation } from '@/web/components/Documentation.tsx';
import { Home } from '@/web/components/Home.tsx';
import { SampleAction } from '@/web/components/SampleAction.tsx';
import SideBar from '@/web/components/SideBar.tsx';
import { AdobeRuntimeContextProvider } from '@/web/context/AdobeRuntimeContextProvider.tsx';
import { PageContextProvider } from '@/web/context/PageContextProvider.tsx';

function App() {
    const navigate = useNavigate();

    return (
        <AdobeRuntimeContextProvider>
            <PageContextProvider title="Aligent App Builder Typescript Template">
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
                                <Route path="/sample-action" element={<SampleAction />} />
                                <Route path="/documentation" element={<Documentation />} />
                            </Routes>
                        </View>
                    </Grid>
                </Provider>
            </PageContextProvider>
        </AdobeRuntimeContextProvider>
    );
}

export default App;
