/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import { ListSortFieldNames, SortOrders } from '../../../constants/Enums';

import styles from './ActionsStep.module.scss';

const Types = {
  ALPHABETICALLY: 'alphabetically',
  BY_DUE_DATE: 'byDueDate',
  OLDEST_FIRST: 'oldestFirst',
  NEWEST_FIRST: 'newestFirst',
};

const DATA_BY_TYPE = {
  [Types.ALPHABETICALLY]: {
    fieldName: ListSortFieldNames.NAME,
  },
  [Types.BY_DUE_DATE]: {
    fieldName: ListSortFieldNames.DUE_DATE,
  },
  [Types.OLDEST_FIRST]: {
    fieldName: ListSortFieldNames.CREATED_AT,
  },
  [Types.NEWEST_FIRST]: {
    fieldName: ListSortFieldNames.CREATED_AT,
    order: SortOrders.DESC,
  },
};

const SortStep = React.memo(({ listId, onBack, onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleSelectTypeClick = useCallback(
    (_, { value: type }) => {
      dispatch(entryActions.sortList(listId, DATA_BY_TYPE[type]));
      onClose();
    },
    [listId, onClose, dispatch],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.sortList', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {[Types.ALPHABETICALLY, Types.BY_DUE_DATE, Types.OLDEST_FIRST, Types.NEWEST_FIRST].map(
            (type) => (
              <Menu.Item
                key={type}
                value={type}
                className={styles.menuItem}
                onClick={handleSelectTypeClick}
              >
                {t(`common.${type}`)}
              </Menu.Item>
            ),
          )}
        </Menu>
      </Popup.Content>
    </>
  );
});

SortStep.propTypes = {
  listId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SortStep;
