# Aligent Typescript Template for Adobe AppBuilder

This repository contains a ready-to-build application including two actions and a simple frontend.
Frontend and action code is fully typed, actions are bundled with sourcemaps using `ts-loader` for step-through debugging.

# Setup

## Prerequisites

- Access to the [Adobe Developer Console](https://developer.adobe.com/developer-console/)
- Access to an existing AppBuilder project.
  - If you're making a new project, follow the steps [here](https://developer.adobe.com/app-builder/docs/get_started/app_builder_get_started/first-app) to create an App project in the Adobe Developer Console.
- Up-to-date global installation of the [Adobe aio CLI](https://developer.adobe.com/runtime/docs/guides/tools/cli_install/)

## Set up the repository

```bash
npm ci # Install dependencies
```

Configure your console by choosing `org`, `project`, and `workspace` to point to your AppBuilder project:
```bash
aio console org select
aio console project select
aio console workspace select
```

Then run `aio app use` to build your `.aio` and `.env` files.


Add the `BASE_URL` environment variable required for the api-sample action to your `.env` file

```bash
BASE_URL=https://pokeapi.co/api/v2/pokemon/
```

## Development

Use the `aio cli` for development commands. A comprehensive list of commands and options can be found on github : https://github.com/adobe/aio-cli

### Serving the app locally

#### Setup
Setup a hostname alias for your local development by running:
```bash
manta host add [app_name] [port_number] -k -s
```
`port_number` is likely to be 9080, but if that's not the case, run `aio app dev` to see what the port number is. After this step, you'll be able to access your local development app at `https://[app_name].aligent.dev`. You'll also need to add `SERVER_HOST=0.0.0.0` to your `.env` file.

#### Commands
- `aio app dev` will serve **both** actions and frontend locally
- `aio app run` will **deploy** actions to the AppBuilder platform and serve the frontend locally

### Debugging in VS Code

Open the VSCode Debugging Panel (`CTRL-Shift-D`) and run either of the pre-defined AppBuilder launch schemas.

Alternatively, create a new Javascript Debug Terminal and run `aio app dev`/`aio app run` as needed.

Breakpoints in typescript code are supported with inline source maps.

### Debugging deployed actions

After your action has been deployed, the logs exists in the server and not in your local, so you'll have to first locate the activation ID of your action:

```bash
aio rt activation list
```

then run:

```bash
aio rt activation logs [activation_id_of_your_action]
```

to see the error logs.


### Test & Coverage

- Run `aio app test` to run the testing suite
- Run `npm run check-types` to check all typescript types

### Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

## Config

### `app.config.yaml`

- Main configuration file that defines an application's implementation.
- Variables in `.env` can be referenced with a `$` prefix e.g. `$SERVICE_API_KEY`
- Documentation: https://developer.adobe.com/app-builder/docs/guides/configuration/#appconfigyaml

```yaml
application:
  hooks:
    pre-app-build: ./hooks/check-action-types.sh && ./hooks/check-web-types.sh
  actions: actions
  web: web-src
  runtimeManifest:
    packages:
      appbuilder:
        license: Apache-2.0
```

### `.env`

> [!CAUTION]
>
> - Do not commit to source control

- Generated with `aio app use`
- Makes secrets and environment variables available at build time
- Documentation: https://developer.adobe.com/app-builder/docs/guides/configuration/#env

```bash
# AIO_RUNTIME_AUTH=
# AIO_RUNTIME_NAMESPACE=

# BASE_URL
```

### `.aio`

> [!CAUTION]
>
> - Do not edit manually
> - Do not commit to source control

- Generated with `aio app use` or the `Download All` button in an Adobe Developer Console workspace
- Configuration for Developer Console
- Documentation: https://developer.adobe.com/app-builder/docs/guides/configuration/#aio

### `*webpack-config.js`

- Used by `aio cli` for bundling typescript code
- Adds inline source maps to support runtime debugging breakpoints in Typescript files

## General pain points in this repository

This setup is brittle and confusing in a few areas. Some of that is because of the aio CLI's opinionated behaviour, some may be because the Typescript and package settings aren't quite right.

- `aio app test` (jest) and `aio app build` (webpack for actions) require a babel setup for typescript support
- Parcel will detect a standard `babel.config.js` file and warn about it
- Babel and parcel do not typecheck, so hooks are used to check types before building actions/web folders
- AppBuilder doesn't support ESM syntax for `*webpack-config.js`, so the whole package has to be commonjs. For consistency only the standard aligent config files (prettier, eslint) are kept as `.mjs`
- Jest doesn't understand the transpiled `.js` imports, requiring `moduleNameMapper` configuration in `jest.config.js`
- `babel-jest` hoists mock declarations to the top of the files which can make it very tricky to mock nested functions from `@adobe/aio-sdk`; the `jest` import is not available at the time mocks are initialised

## Under development

- [ ] Deployment pipeline
- [ ] Pre-commit hooks
- [x] Front End calling deployed actions
- [ ] Front End extension point example
- [x] Cleaner tsconfig setup separating tests, actions, web code
- [x] Use Babel instead of ts-loader for action compiling
