console.log('Autoslash-AI App Initializing...');
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';
import './i18n';

function sanitizeClerkKey(key: string | undefined): string | undefined {
  if (!key) return key;
  const match = key.match(/pk_(?:test|live)_[a-zA-Z0-9$]+/);
  return match ? match[0] : key;
}

const PUBLISHABLE_KEY = sanitizeClerkKey(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
