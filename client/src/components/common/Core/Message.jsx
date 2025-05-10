/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Message.module.scss';

const Types = {
  INFO: 'info',
  ERROR: 'error',
};

const Message = React.memo(({ type, header, content }) => (
  <div className={classNames(styles.wrapper, styles[`wrapper${upperFirst(type)}`])}>
    <div className={styles.header}>{header}</div>
    <div className={styles.content}>{content}</div>
  </div>
));

Message.propTypes = {
  type: PropTypes.oneOf(Object.values(Types)).isRequired,
  header: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};

export default Message;
