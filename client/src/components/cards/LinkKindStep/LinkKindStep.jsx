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
import uniqueBy from '../../../utils/unique-array';
import {
  invertCardRelationKind,
  getAllCardRelationKinds,
} from '../../../utils/cardRelationKinds-helpers';

import styles from './LinkKindStep.module.scss';

const LinkKindStep = React.memo(({ onSelect, onDeselect, onBack }) => {
  const [t] = useTranslation();

  const board = useSelector(selectors.selectCurrentBoard);
  const cards = useSelector(selectors.selectCardsForCurrentBoard);

  const getCount = useCallback(
    (kind) => {
      let cardCount = 0;

      // get all relations of the given kind
      const allRelations = cards
        .flatMap((card) => card.cardRelations)
        .filter((r) => r.kind === kind);
      // get unique relations by id (they might show up at both sides of the relation)
      const uniqueRelations = uniqueBy(allRelations, (r) => r.id);
      // get unique card ids from the relations
      const uniqueCardIds = uniqueRelations.map((r) => r.cardId);

      // get the inverted kind of the relation (e.g. "blocks" -> "is blocked by")
      const invertedKind = invertCardRelationKind(kind);

      if (invertedKind !== kind) {
        // if kind is asymmetric, we need to add the real count of inverted relations (e.g. "blocks" -> "is blocked by")
        const invertedRelations = cards
          .flatMap((card) => card.cardRelations)
          .filter((r) => r.kind === invertedKind);

        // get unique inverted relations by id (they might show up at both sides of the relation)
        const uniqueInvertedRelations = uniqueBy(invertedRelations, (r) => r.id);
        // get unique card ids from the inverted relations
        const invertedUniqueCardIds = uniqueInvertedRelations.map((r) => r.relatedCardId);

        // combine the unique card ids from both kinds and get the unique count
        const allUniqueCardIds = uniqueBy([...uniqueCardIds, ...invertedUniqueCardIds], (id) => id);

        // the count is the number of unique card ids from both kinds
        cardCount = allUniqueCardIds.length;
      } else {
        // if kind is symmetric, we just need to double the count for each side
        cardCount = uniqueCardIds.length * 2; // each relation counts for both cards
      }

      return cardCount;
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
