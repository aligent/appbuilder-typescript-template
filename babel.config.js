// Babel configuration allowing compilation of typescript files in both
// test and src/action folders
module.exports = {
    presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
};
