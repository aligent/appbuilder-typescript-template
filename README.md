# Aligent Typescript Template for Adobe AppBuilder

This repository contains a ready-to-build application including two actions and a simple frontend.
Frontend and action code is fully typed and bundled with sourcemaps using `ts-loader`.

# Setup

## Prerequisites

- Access to the [Adobe Developer Console](https://developer.adobe.com/developer-console/)
- Access to an existing AppBuilder project
- Up-to-date global installation of the [Adobe aio CLI](https://developer.adobe.com/runtime/docs/guides/tools/cli_install/)

## Set up the repository

```bash
npm ci # Install dependencies
aio app use # Select the desired workspace - this will build your .aio and .env files
```

Add the BASE_URL environment variable required for the api-sample action to your `.env` file

```bash
BASE_URL=https://pokeapi.co/api/v2/pokemon/
```

## Local Development

- `aio app dev` will serve **both** actions and frontend locally
- `aio app run` will **deploy** actions to the AppBuilder platform and serve the frontend locally
- The local server is exposed on `localhost:9080` by default

## Debugging in VS Code

Open the VSCode Debugging Panel (`CTRL-Shift-D`) and run either of the pre-defined AppBuilder launch schemas.

Alternatively, create a new Javascript Debug Terminal and run `aio app dev`/`aio app run` as needed.

Breakpoints in typescript code are supported with inline source maps.

## Test & Coverage

- Run `aio app test` to run unit tests for ui and actions
- Run `aio app test --e2e` to run e2e tests

## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

## Config

### `app.config.yaml`

- Main configuration file that defines an application's implementation.
- Variables in `.env` can be referenced with a `$` prefix e.g. `$SERVICE_API_KEY`
- Documentation: https://developer.adobe.com/app-builder/docs/guides/configuration/#appconfigyaml

```yaml
application:
  actions: actions
  web: web-src
  runtimeManifest:
    packages:
      appbuilder:
        license: Apache-2.0
```

### `.env`

- Generated with `aio app use`
- Makes secrets and environment variables available at build time
- **do not commit to source control**
- Documentation: https://developer.adobe.com/app-builder/docs/guides/configuration/#env

```bash
# AIO_RUNTIME_AUTH=
# AIO_RUNTIME_NAMESPACE=

# BASE_URL
```

### `.aio`

- Generated with `aio app use`
- Configuration for Developer Console
- **do not edit manually**
- **do not commit to source control**
- Documentation: https://developer.adobe.com/app-builder/docs/guides/configuration/#aio

## General pain points in this repository

This setup is brittle and confusing in a few areas. Some of that is because of the aio CLI's opinionated behaviour, some may be because the Typescript and package settings aren't quite right.

- AppBuilder doesn't support ESM syntax for `*webpack-config.js`, so the whole package has to be commonjs. For consistency only the standard aligent config files (prettier, eslint) are kept as `.mjs`
- The `ts-loader` plugin for webpack and `"noEmit": false` in tsconfig.json are required for bundling typescript code
- `"noEmit": false` means `"allowImportingTsExtensions": true` can't be set, so code must import files using `.js` or `.jsx` extensions
- `aio app test` only works with Jest, requiring a Babel configuration to use `@babel/preset-typescript`
- `aio app run` uses Parcel with an internal Babel config and warns about the Babel config file, so it has been renamed and pointed to with the `transform` config in `jest.config.js`
- Jest doesn't understand `.js` imports in Typescript files, requiring `moduleNameMapper` configuration in `jest.config.js`
- `babel-jest` hoists mock declarations to the top of the files which can make it very tricky to mock nested functions from `@adobe/aio-sdk`; the `jest` import is not available at the time mocks are initialised

## Under development

- [ ] Deployment pipeline
- [ ] Pre-commit hooks
- [ ] Front End calling deployed actions
- [ ] Front End extension point example
- [ ] Cleaner tsconfig setup separating tests, actions, web code
