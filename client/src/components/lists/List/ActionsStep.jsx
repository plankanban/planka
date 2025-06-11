/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useSteps } from '../../../hooks';
import { ListTypes } from '../../../constants/Enums';
import EditColorStep from './EditColorStep';
import SortStep from './SortStep';
import SelectListTypeStep from '../SelectListTypeStep';
import ConfirmationStep from '../../common/ConfirmationStep';
import ArchiveCardsStep from '../../cards/ArchiveCardsStep';
import BoardSelectStep from './BoardSelectStep';
import api from '../../../api/lists';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_TYPE: 'EDIT_TYPE',
  EDIT_COLOR: 'EDIT_COLOR',
  SORT: 'SORT',
  ARCHIVE_CARDS: 'ARCHIVE_CARDS',
  DELETE: 'DELETE',
  MOVE_TO_BOARD: 'MOVE_TO_BOARD',
};

const ActionsStep = React.memo(({ listId, onNameEdit, onCardAdd, onClose }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const list = useSelector((state) => selectListById(state, listId));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const navigate = useNavigate();

  const handleTypeSelect = useCallback(
    (type) => {
      dispatch(
        entryActions.updateList(listId, {
          type,
        }),
      );
    },
    [listId, dispatch],
  );

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteList(listId));
  }, [listId, dispatch]);

  const handleEditNameClick = useCallback(() => {
    onNameEdit();
    onClose();
  }, [onNameEdit, onClose]);

  const handleAddCardClick = useCallback(() => {
    onCardAdd();
    onClose();
  }, [onCardAdd, onClose]);

  const handleEditTypeClick = useCallback(() => {
    openStep(StepTypes.EDIT_TYPE);
  }, [openStep]);

  const handleEditColorClick = useCallback(() => {
    openStep(StepTypes.EDIT_COLOR);
  }, [openStep]);

  const handleSortClick = useCallback(() => {
    openStep(StepTypes.SORT);
  }, [openStep]);

  const handleArchiveCardsClick = useCallback(() => {
    openStep(StepTypes.ARCHIVE_CARDS);
  }, [openStep]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  const handleMoveToBoard = useCallback(
    async (targetBoardId) => {
      try {
        const { item: updatedList, included } = await api.moveToBoard(listId, { targetBoardId });
        dispatch(entryActions.handleListUpdate(updatedList));
        if (included && included.cards) {
          dispatch(entryActions.handleCardsUpdate(included.cards, []));
        }
        sessionStorage.setItem('movedListId', listId);
        onClose();
        navigate(`/boards/${targetBoardId}`);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    },
    [listId, onClose, dispatch, navigate],
  );

  if (step) {
    switch (step.type) {
      case StepTypes.EDIT_TYPE:
        return (
          <SelectListTypeStep
            withButton
            defaultValue={list.type}
            title="common.editType"
            buttonContent="action.save"
            onSelect={handleTypeSelect}
            onBack={handleBack}
            onClose={onClose}
          />
        );
      case StepTypes.EDIT_COLOR:
        return <EditColorStep listId={listId} onBack={handleBack} onClose={onClose} />;
      case StepTypes.SORT:
        return <SortStep listId={listId} onBack={handleBack} onClose={onClose} />;
      case StepTypes.ARCHIVE_CARDS:
        return <ArchiveCardsStep listId={listId} onBack={handleBack} onClose={onClose} />;
      case StepTypes.DELETE:
        return (
          <ConfirmationStep
            title="common.deleteList"
            content="common.areYouSureYouWantToDeleteThisList"
            buttonContent="action.deleteList"
            onConfirm={handleDeleteConfirm}
            onBack={handleBack}
          />
        );
      case StepTypes.MOVE_TO_BOARD:
        return (
          <BoardSelectStep
            currentBoardId={list.boardId}
            onSelect={handleMoveToBoard}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Popup.Header>
        {t('common.listActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Menu.Item className={styles.menuItem} onClick={handleEditNameClick}>
            {t('action.editTitle', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleEditTypeClick}>
            {t('action.editType', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleEditColorClick}>
            {t('action.editColor', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleAddCardClick}>
            {t('action.addCard', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleSortClick}>
            {t('action.sortList', {
              context: 'title',
            })}
          </Menu.Item>
          {list.type === ListTypes.CLOSED && (
            <Menu.Item className={styles.menuItem} onClick={handleArchiveCardsClick}>
              {t('action.archiveCards', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
            {t('action.deleteList', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={() => openStep(StepTypes.MOVE_TO_BOARD)}>
            {t('action.moveListToBoard', { context: 'title' })}
          </Menu.Item>
        </Menu>
      </Popup.Content>
    </>
  );
});

ActionsStep.propTypes = {
  listId: PropTypes.string.isRequired,
  onNameEdit: PropTypes.func.isRequired,
  onCardAdd: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
