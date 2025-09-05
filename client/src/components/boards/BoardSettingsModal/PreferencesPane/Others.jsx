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

import styles from './Others.module.scss';

const Others = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const board = useSelector((state) => selectBoardById(state, boardId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleChange = useCallback(
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
    <Segment basic>
      <Radio
        toggle
        name="alwaysDisplayCardCreator"
        checked={board.alwaysDisplayCardCreator}
        label={t('common.alwaysDisplayCardCreator')}
        className={styles.radio}
        onChange={handleChange}
      />
      <Radio
        toggle
        name="expandTaskListsByDefault"
        checked={board.expandTaskListsByDefault}
        label={t('common.expandTaskListsByDefault')}
        className={styles.radio}
        onChange={handleChange}
      />
    </Segment>
  );
});

export default Others;
