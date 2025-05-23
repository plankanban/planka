/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ReactTimeAgo from 'react-time-ago';

import getDateFormat from '../../../utils/get-date-format';
import ExpirableTime from './ExpirableTime';

const TimeAgo = React.memo(({ date, withExpiration }) => {
  const [t, i18n] = useTranslation();

  const verboseDateFormatter = useCallback(
    (value) =>
      t(`format:${getDateFormat(value)}`, {
        value,
        postProcess: 'formatDate',
      }),
    [t],
  );

  return (
    <ReactTimeAgo
      date={date}
      timeStyle="round-minute"
      locale={i18n.resolvedLanguage}
      component={withExpiration ? ExpirableTime : undefined}
      formatVerboseDate={verboseDateFormatter}
    />
  );
});

TimeAgo.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  withExpiration: PropTypes.bool,
};

TimeAgo.defaultProps = {
  withExpiration: false,
};

export default TimeAgo;
