import { defaultTheme, Grid, Provider, View } from '@adobe/react-spectrum';
import { About } from './About.jsx';
import { Home } from './Home.jsx';
import SideBar from './SideBar.jsx';

function App() {
    return (
        <Provider theme={defaultTheme} colorScheme={'light'}>
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
                    <Home />
                    <About />
                </View>
            </Grid>
        </Provider>
    );
}

export default App;
