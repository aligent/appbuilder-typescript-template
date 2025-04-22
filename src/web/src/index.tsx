import { createRoot } from 'react-dom/client';
import App from './components/App.tsx';
import './index.css';

// Render the application and provide it with the runtime and ims details
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
