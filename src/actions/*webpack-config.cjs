// Webpack configuration required to compile typescript action and web source code
// using the Adobe aio CLI. Adapted from https://github.com/adobe/aio-cli-plugin-app-dev
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
                // Test for .ts (and potentially .tsx if needed)
                test: /\.ts$/, // Adjust if you use .tsx: /\.tsx?$/
                exclude: /node_modules/,
                // Use babel-loader instead of ts-loader
                loader: 'babel-loader',
                // Babel options are typically read from babel.config.js,
                // but can be specified here if needed:
                // options: { presets: [...] }
            },
            // {
            //     // includes, excludes are in tsconfig.json
            //     test: /\.ts?$/,
            //     exclude: /node_modules/,
            //     loader: 'ts-loader',
            // },
        ],
    },
};
