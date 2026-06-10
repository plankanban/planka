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

import { CardRelationKinds } from '../../../constants/Enums';

import styles from './LinkTypeStep.module.scss';

const LinkTypeStep = React.memo(({ onSelect, onDeselect, onBack }) => {
  const [t] = useTranslation();

  const board = useSelector(selectors.selectCurrentBoard);

  const cardRelations = [
    {
      key: CardRelationKinds.RELATED,
      value: CardRelationKinds.RELATED,
    },
    {
      key: CardRelationKinds.PARENT,
      value: CardRelationKinds.PARENT,
    },
    {
      key: CardRelationKinds.CHILD,
      value: CardRelationKinds.CHILD,
    },
    {
      key: CardRelationKinds.BLOCKS,
      value: CardRelationKinds.BLOCKS,
    },
    {
      key: CardRelationKinds.BLOCKEDBY,
      value: CardRelationKinds.BLOCKEDBY,
    },
    {
      key: CardRelationKinds.DUPLICATE,
      value: CardRelationKinds.DUPLICATE,
    },
  ];

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
                  styles.cardRelationKindChip,
                  styles[`cardRelationKind-chip-${kind.key.toLowerCase()}`],
                )}
              >
                {kind.value}
              </div>
            </Menu.Item>
          ))}
        </Menu>
      </Popup.Content>
    </>
  );
});

LinkTypeStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

LinkTypeStep.defaultProps = {
  onBack: undefined,
};

export default LinkTypeStep;
