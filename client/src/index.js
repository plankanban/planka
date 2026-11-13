/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

import store from './store';
import history from './history';
import Root from './components/common/Root';

import './i18n';

// Boot Novus once with an anonymous visitor. The signed-in user is identified later,
// once the core data has loaded.
window.pendo.initialize({
  visitor: {
    id: '',
  },
  location: {
    transforms: [
      {
        // Demo mode prefills the login form from the URL fragment
        // (#emailOrUsername=...&password=...). The app routes on the path, not the hash,
        // so clearing the fragment keeps those credentials out of recorded URLs.
        attr: 'hash',
        action: 'Clear',
      },
    ],
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
