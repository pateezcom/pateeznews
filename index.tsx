import * as ReactNamespace from 'react';
import * as ReactDOMNamespace from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

// Google Story Editor ve diğer eski kütüphaneler için global tanımlamalar
// @ts-ignore
window.React = ReactNamespace;
// @ts-ignore
globalThis.React = ReactNamespace;
// @ts-ignore
window.ReactDOM = ReactDOMNamespace;
// @ts-ignore
globalThis.ReactDOM = ReactDOMNamespace;
// @ts-ignore
window.global = window;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <ReactNamespace.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </ReactNamespace.StrictMode>
);
