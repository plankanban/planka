import React from 'react';
import ReactDOM from 'react-dom/client';

import store from './store';
import history from './history';
import Root from './components/Root';
// import appConfig from './api/appconfig';
import './i18n';

fetch('http://localhost:1337/api/appconfig').then((response) => {
  response.json().then((config) => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(Root, { store, history, config }));
  });
});
