import React from 'react';
import { createRoot } from 'react-dom/client';

import store, { history } from './store';
import Root from './components/Root';

import './i18n';

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(Root, { store, history }));
