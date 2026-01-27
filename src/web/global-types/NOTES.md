# Purpose of TypeScript Module Declarations

This document explains the purpose of custom TypeScript declarations added for Adobe App Builder modules and Spectrum icons in the project.

> **Note:** These declarations were required after migrating the project to ESM (ECMAScript Modules), as TypeScript needs explicit module definitions for certain imports that no longer resolve automatically.

## Adobe App Builder Modules

### Modules

- `@adobe/exc-app/ims`
- `@adobe/exc-app/page`
- `@adobe/exc-app/topbar`

### Purpose

- TypeScript does not ship with type definitions for these internal Adobe modules.
- Declaring minimal module types allows TypeScript to understand the shape of the objects you actually use, such as `ImsProfile`, `page.done()`, and `topbar.solution`.
- **Effect:** Eliminates “Cannot find module” and related type errors when importing and using these modules.

## Spectrum Icons

### Icons

- `@spectrum-icons/workflow/Brackets`
- `@spectrum-icons/workflow/BracketsSquare`
- `@spectrum-icons/workflow/Search`

### Purpose

- These icons are default-exported functions that return JSX elements.
- TypeScript cannot infer JSX element types from plain `declare module` statements.
- Declaring them as `const` with their props type (`IconPropsWithoutChildren`) informs TypeScript that they are valid JSX components.
- **Effect:** Eliminates “JSX element type … does not have any construct
