import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import auth0Config from './auth0-config';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

const onRedirectCallback = (appState) => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

root.render(
  <Auth0Provider
    domain={auth0Config.domain}
    clientId={auth0Config.clientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: 'https://monitoreo-solar-api',
      scope: 'openid profile email',
    }}
    onRedirectCallback={onRedirectCallback}
    cacheLocation="localstorage"
    useRefreshTokens={true}
  >
    <App />
  </Auth0Provider>
);
