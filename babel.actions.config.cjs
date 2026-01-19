// Babel configuration allowing compilation of typescript files in both
// test and src/action folders
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: { node: 'current' },
                modules: false, // This is important to prevent Babel from transforming ESM to CommonJS and let Webpack handle ESM
            },
        ],
    ],
    ignore: ['**/src/web/**', '**/node_modules/**'],
};
