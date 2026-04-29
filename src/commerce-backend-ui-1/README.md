# Commerce Backend UI Extension

Adobe Commerce Admin panel extension using Adobe UI Extensibility (UIX).

## Structure

```
commerce-backend-ui-1/
├── ext.config.yaml          # Extension configuration and action definitions
├── actions/
│   └── registration/        # UIX extension registration action
│       └── index.ts
└── web-src/
    ├── index.html            # Entry point
    ├── tsconfig.json         # TypeScript config for web code
    └── src/
        ├── index.tsx         # Bootstrap (Experience Cloud Shell + standalone)
        ├── index.css
        ├── config.json       # Action URL mappings (auto-generated at build)
        ├── exc-runtime.js    # Adobe Experience Cloud Runtime loader
        ├── components/
        │   ├── App.tsx                   # Root component with router and error boundary
        │   ├── ExtensionRegistration.tsx  # UIX guest registration
        │   └── MainPage.tsx              # Main page with IMS auth
        ├── hooks/
        │   └── useImsAuth.ts  # IMS authentication hook
        └── types/
            └── index.ts       # Shared type definitions
```

## Changing the Extension ID

The template uses `'sample'` as the default extension ID. When creating a new app, replace it with your own unique ID in these files:

| File | What to change |
|------|---------------|
| `actions/registration/index.ts` | `extensionId` variable (line 7) — used for menu item IDs and section IDs |
| `web-src/src/components/ExtensionRegistration.tsx` | `EXTENSION_ID` constant (line 8) — used to register with UIX guest |
| `web-src/src/hooks/useImsAuth.ts` | `EXTENSION_ID` constant (line 6) — used to attach to UIX guest for auth |
| `web-src/src/index.tsx` | `runtime.solution.title`, `runtime.solution.shortTitle`, and `runtime.title` — displayed in the Experience Cloud Shell header |

All four files must use the **same extension ID** for the extension to work correctly.

### Example

To change from `'sample'` to `'my-product-labels'`:

```ts
// actions/registration/index.ts
const extensionId = 'my-product-labels';

// ExtensionRegistration.tsx
const EXTENSION_ID = 'my-product-labels';

// useImsAuth.ts
const EXTENSION_ID = 'my-product-labels';
```

## Getting Started

1. Change the extension ID in all files listed above
2. Update the title in `index.tsx` (`runtime.solution` and `runtime.title`)
3. Add your actions to `ext.config.yaml` under `runtimeManifest.packages`
4. Build your UI in `MainPage.tsx` using the `imsToken` and `imsOrgId` from `useImsAuth`

## IMS Authentication

The `useImsAuth` hook provides IMS token and org ID for authenticated API calls:

```tsx
const { imsToken, imsOrgId, isInitialized } = useImsAuth(ims);
```

- In the Experience Cloud Shell: retrieves auth from UIX guest connection
- In standalone mode (localhost): falls back to the IMS context passed from `index.tsx`
