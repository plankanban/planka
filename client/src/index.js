import React from 'react';
import ReactDOM from 'react-dom';

import store from './store';
import history from './history';
import Root from './components/Root';

import './i18n';

ReactDOM.render(React.createElement(Root, { store, history }), document.getElementById('root'));
