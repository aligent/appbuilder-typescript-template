// Webpack configuration required to compile typescript action and web source code
// using the Adobe aio CLI. Adapted from https://github.com/adobe/aio-cli-plugin-app-dev
// Appbuilder documentation: https://developer.adobe.com/app-builder/docs/guides/configuration/webpack-configuration/

module.exports = {
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                // includes, excludes are in tsconfig.json
                test: /\.ts?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
                resolve: {
                    extensionAlias: {
                        '.js': ['.ts', '.js'],
                        '.jsx': ['.tsx', '.jsx'],
                    },
                },
            },
        ],
    },
};
