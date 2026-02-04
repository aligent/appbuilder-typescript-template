import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';

import App from '@/web/components/App.tsx';

import './index.css';

// Render the application. Currently we do not provide
// runtime and ims details to the application, so it can't run deployed actions
const root = createRoot(document.getElementById('root')!);

root.render(
    // HashRouter is used to support routing on manual page refresh
    <HashRouter>
        <App />
    </HashRouter>
);
