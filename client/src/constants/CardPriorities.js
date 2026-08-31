/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const CARD_PRIORITY_MIN = 1;
export const CARD_PRIORITY_MAX = 10;

export const CardPriorityBands = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'veryHigh',
  URGENT: 'urgent',
};

const BANDS_BY_MAX_VALUE = [
  {
    maxValue: 2,
    band: CardPriorityBands.LOW,
    color: '#9e9e9e',
  },
  {
    maxValue: 4,
    band: CardPriorityBands.MEDIUM,
    color: '#1976d2',
  },
  {
    maxValue: 6,
    band: CardPriorityBands.HIGH,
    color: '#f57f17',
  },
  {
    maxValue: 8,
    band: CardPriorityBands.VERY_HIGH,
    color: '#e65100',
  },
  {
    maxValue: 10,
    band: CardPriorityBands.URGENT,
    color: '#cd2626',
  },
];

export const getCardPriorityBand = (value) =>
  (BANDS_BY_MAX_VALUE.find(({ maxValue }) => value <= maxValue) || BANDS_BY_MAX_VALUE.at(-1)).band;

export const getCardPriorityColor = (value) =>
  (BANDS_BY_MAX_VALUE.find(({ maxValue }) => value <= maxValue) || BANDS_BY_MAX_VALUE.at(-1)).color;
