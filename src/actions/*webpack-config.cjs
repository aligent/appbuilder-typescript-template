// Webpack configuration required to compile typescript action and web source code
// using the Adobe aio CLI. Adapted from https://github.com/adobe/aio-cli-plugin-app-dev, then switched to babel-loader
// Appbuilder documentation: https://developer.adobe.com/app-builder/docs/guides/configuration/webpack-configuration/

module.exports = {
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts'],
        extensionAlias: {
            '.js': ['.ts', '.js'],
        },
    },
    module: {
        rules: [
            {
                // Test for .ts - in theory actions should never use .tsx
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    // Point to the babel config for actions
                    // This is done to avoid Parcel reading the config file
                    // while building web code
                    configFile: './babel.actions.config.cjs',
                },
            },
        ],
    },
};
