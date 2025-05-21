import { Heading, Text, View } from '@adobe/react-spectrum';
export const Home = () => (
    <View width="size-16000">
        <Heading level={1}>Welcome to the Aligent AppBuilder Typescript Template!</Heading>
        <Text>
            This template is a starting point for building a web app using AppBuilder. It
            demonstrates:
        </Text>
        <ul>
            <li>Providing a unified look and feel with React Spectrum components</li>
            <li>Using HashRouter to support page routing and manual page reloads</li>
            <li>Invoking AppBuilder actions with a reusable React hook</li>
            <li>Using the Adobe I/O Runtime SDK for authentication</li>
        </ul>
    </View>
);
