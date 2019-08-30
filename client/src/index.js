import React from 'react';
import ReactDOM from 'react-dom';

import store from './store';
import history from './history';
import * as serviceWorker from './service-worker';
import Root from './components/Root';

import './i18n';

ReactDOM.render(React.createElement(Root, { store, history }), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
