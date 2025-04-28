//
declare module '@adobe/aio-sdk' {
    namespace Core {
        // The types declared in @adobe/aio-lib-core-config are inaccurate, providing our own declaration here
        class ConfigAPI {
            /**
             * Gets the value for a key in the Config.
             * If no parameters are specified, it will return all keys and values of the consolidated Config.
             * @param [key = ''] - the key to get the value from
             * @param [source] - 'global', 'local', or 'env'. Defaults to searching the consolidated config.
             */
            get(key?: string, source?: string): string | Record<string, string>;
            /**
             * Set the value for a key in the Config.
             * @param key - the key to set the value to
             * @param value - the value to save for the key
             * @param [local = false] - Set to true to save the value in the local config. Defaults to false (save to global config).
             */
            set(key: string, value: string, local?: boolean): ConfigAPI;
            /**
             * Delete a key and its value in the Config.
             * @param key - the key to delete the value from
             * @param [local = false] - Set to true to delete the value in the local config. Defaults to false (save to global config).
             */
            delete(key: string, local?: boolean): ConfigAPI;
            /**
             * Reload the Config from all the config file(s)
             */
            reload(): ConfigAPI;
            /**
             * Pipe data from stdin.
             */
            getPipedData(): Promise<string>;
            /**
             * Hoists variables in the ./.env file to process.env
             * @param force - force the loading of the .env file
             */
            dotenv(force?: boolean): void;
        }

        const Config: ConfigAPI;
    }
}
