/* ============================================================
   TradeLink — Entry Point
   ============================================================ */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/reduxStore';
import App from './App';
import DevMenu from './components/common/DevMenu';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <DevMenu />
    </Provider>
  </StrictMode>
);
