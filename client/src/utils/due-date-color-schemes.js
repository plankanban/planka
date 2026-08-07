/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { DueDateColorSchemes } from '../constants/Enums';

const STATUS_STYLE_BY_SCHEME = {
  [DueDateColorSchemes.DEFAULT]: {
    dueSoon: 'dueSoon',
    overdue: 'overdue',
    completed: 'completed',
  },
  [DueDateColorSchemes.BLUE_ORANGE]: {
    dueSoon: 'blueOrangeDueSoon',
    overdue: 'blueOrangeOverdue',
    completed: 'blueOrangeCompleted',
  },
};

const STATUS_ICON_COLOR_BY_SCHEME = {
  [DueDateColorSchemes.DEFAULT]: {
    dueSoon: 'orange',
    overdue: 'red',
    completed: 'green',
  },
  [DueDateColorSchemes.BLUE_ORANGE]: {
    dueSoon: 'orange',
    overdue: 'blue',
    completed: 'teal',
  },
};

export const getDueDateStatusStyle = (status, scheme) =>
  (STATUS_STYLE_BY_SCHEME[scheme] || STATUS_STYLE_BY_SCHEME[DueDateColorSchemes.DEFAULT])[status];

export const getDueDateStatusIconColor = (status, scheme) =>
  (STATUS_ICON_COLOR_BY_SCHEME[scheme] || STATUS_ICON_COLOR_BY_SCHEME[DueDateColorSchemes.DEFAULT])[
    status
  ];
