/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { Button, Icon, Message } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { BoardContexts } from '../../../constants/Enums';
import { BoardContextIcons } from '../../../constants/Icons';

import styles from './EmptyTrashToast.module.scss';

const EmptyTrashToast = React.memo(({ id, listId }) => {
  const isCurrentList = useSelector((state) => listId === selectors.selectCurrentListId(state));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleReturnClick = useCallback(() => {
    dispatch(entryActions.updateContextInCurrentBoard(BoardContexts.BOARD));
    toast.dismiss(id);
  }, [id, dispatch]);

  return (
    <Message visible positive size="tiny">
      <Icon name="checkmark" />
      {t('common.trashHasBeenSuccessfullyEmptied')}
      {isCurrentList && (
        <Button
          content={t(`action.returnToBoard`)}
          icon={BoardContextIcons[BoardContexts.BOARD]}
          size="mini"
          className={styles.button}
          onClick={handleReturnClick}
        />
      )}
    </Message>
  );
});

EmptyTrashToast.propTypes = {
  id: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
};

export default EmptyTrashToast;
