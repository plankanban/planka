/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Popup } from '../../../lib/custom-ui';
import selectors from '../../../selectors';

import { getAllCardRelationKinds } from '../../../utils/cardRelationKinds-helpers';

import styles from './LinkKindStep.module.scss';

const LinkKindStep = React.memo(({ onSelect, onDeselect, onBack }) => {
  const [t] = useTranslation();

  const board = useSelector(selectors.selectCurrentBoard);
  const cards = useSelector(selectors.selectCardsForCurrentBoard);

  const getCount = useCallback(
    (kind) => {
      return cards.reduce((count, card) => {
        const filtered = card.cardRelations.filter((r) => r.kind === kind);
        if (filtered.length > 0) {
          return count + 1;
        }
        return count;
      }, 0);
    },
    [cards],
  );

  const cardRelations = getAllCardRelationKinds().map((kind) => ({
    ...kind,
    count: getCount(kind.value),
  }));

  const handleToggleClick = useCallback(
    (kind) => {
      // get select for board
      if (board.filterRelationKinds.includes(kind)) {
        onDeselect(kind);
      } else {
        onSelect(kind);
      }
    },
    [onSelect, onDeselect, board],
  );

  const isActive = useCallback((kind) => board.filterRelationKinds.includes(kind.value), [board]);

  const getKindLabel = useCallback(
    (k) => {
      return t(`common.${k.value}`);
    },
    [t],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.relations', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {cardRelations.map((kind) => (
            <Menu.Item
              key={kind.key}
              className={styles.menuItem}
              onClick={() => handleToggleClick(kind.value)}
            >
              <div
                className={classNames(
                  isActive(kind) && styles.active,
                  styles.linkChip,
                  styles[`${kind.key.toLowerCase()}`],
                )}
              >
                <span>{getKindLabel(kind)}</span>
                <span className={styles.count}>{kind.count}</span>
              </div>
            </Menu.Item>
          ))}
        </Menu>
      </Popup.Content>
    </>
  );
});

LinkKindStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

LinkKindStep.defaultProps = {
  onBack: undefined,
};

export default LinkKindStep;
