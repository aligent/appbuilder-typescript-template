module.exports = {
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '\\.ts$': ['babel-jest', {
            // Point to the babel config for actions
            // This is done to avoid Parcel reading the config file
            // while building web code
            configFile: './babel.actions.config.js'
        }],
    },
};
