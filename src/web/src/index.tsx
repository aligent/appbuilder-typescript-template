import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import App from './components/App.tsx';
import './index.css';

// Render the application. Currently we do not provide
// runtime and ims details to the application, so it can't run deployed actions
const root = createRoot(document.getElementById('root')!);

/* **here you can mock the exc runtime and ims objects** */
const mockRuntime = { on: () => {} };
const mockIms = { token: 'mock-token', org: 'mock-org' };

root.render(
    // HashRouter is used to support routing on manual page refresh
    <HashRouter>
        <App runtime={mockRuntime} ims={mockIms} />
    </HashRouter>
);
