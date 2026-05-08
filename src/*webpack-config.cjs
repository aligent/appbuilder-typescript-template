// Shared webpack config for every action in this app (headless and extensions).
// Placed at src/ so aio-lib-runtime's config discovery (walks up from each action's
// directory) finds it for src/actions/, src/commerce-configuration-1/, and
// src/commerce-extensibility-1/ builds alike.

const path = require('path');

let libAppDir;
try {
    libAppDir = path.dirname(
        require.resolve('@adobe/aio-commerce-lib-app/package.json'),
    );
} catch {
    // Package not installed — commerce extensions not in use
}

const babelConfig = path.resolve(__dirname, '../babel.actions.config.js');

// Directories whose ESM .js files must go through babel-loader:
// the auto-generated extension actions and the lib-app package itself.
const esmJsRoots = [
    path.resolve(__dirname, 'commerce-configuration-1', '.generated'),
    path.resolve(__dirname, 'commerce-extensibility-1', '.generated'),
    ...(libAppDir ? [libAppDir] : []),
];

module.exports = {
    devtool: 'inline-source-map',
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
        },
        extensions: ['.ts'],
        extensionAlias: {
            '.js': ['.ts', '.js'],
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: { configFile: babelConfig },
                },
            },
            {
                test: (resource) =>
                    resource.endsWith('.js')
                    && esmJsRoots.some((root) => resource.startsWith(root + path.sep)),
                use: {
                    loader: 'babel-loader',
                    options: {
                        // Don't use the shared configFile — it targets node:current
                        // which skips ESM→CJS conversion. These .generated files
                        // need explicit module transformation for webpack.
                        presets: [
                            ['@babel/preset-env', { targets: { node: '22' }, modules: 'commonjs' }],
                        ],
                        sourceType: 'unambiguous',
                    },
                },
            },
        ],
    },
};
