/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Radio, Segment } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import SelectCardType from '../../../cards/SelectCardType';

import styles from './DefaultCardType.module.scss';

const DefaultCardType = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const board = useSelector((state) => selectBoardById(state, boardId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleSelect = useCallback(
    (defaultCardType) => {
      dispatch(
        entryActions.updateBoard(boardId, {
          defaultCardType,
        }),
      );
    },
    [boardId, dispatch],
  );

  const handleToggleChange = useCallback(
    (_, { name: fieldName, checked }) => {
      dispatch(
        entryActions.updateBoard(boardId, {
          [fieldName]: checked,
        }),
      );
    },
    [boardId, dispatch],
  );

  return (
    <>
      <SelectCardType value={board.defaultCardType} onSelect={handleSelect} />
      <Segment basic className={styles.settings}>
        <Radio
          toggle
          name="limitCardTypesToDefaultOne"
          checked={board.limitCardTypesToDefaultOne}
          label={t('common.limitCardTypesToDefaultOne')}
          className={styles.radio}
          onChange={handleToggleChange}
        />
      </Segment>
    </>
  );
});

export default DefaultCardType;
