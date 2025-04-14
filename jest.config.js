module.exports = {
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '\\.ts$': ['babel-jest', { configFile: './babel.config.test.js' }],
    },
};
