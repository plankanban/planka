import React from 'react';
import ReactDOM from 'react-dom/client';

import store, { history } from './store';
import Root from './components/Root';

import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
