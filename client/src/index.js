import React from 'react';
import ReactDOM from 'react-dom/client';

import Config from './constants/Config';
import store from './store';
import history from './history';
import Root from './components/Root';
import './i18n';

fetch(`${Config.SERVER_BASE_URL}/api/appconfig`).then((response) => {
  response.json().then((config) => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(Root, { store, history, config }));
  });
});
