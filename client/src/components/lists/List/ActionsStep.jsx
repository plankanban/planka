/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
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

import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_TYPE: 'EDIT_TYPE',
  EDIT_COLOR: 'EDIT_COLOR',
  SORT: 'SORT',
  ARCHIVE_CARDS: 'ARCHIVE_CARDS',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(({ listId, onNameEdit, onCardAdd, onClose }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const list = useSelector((state) => selectListById(state, listId));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

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
            <Icon name="edit outline" className={styles.menuItemIcon} />
            {t('action.editTitle', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleEditTypeClick}>
            <Icon name="map outline" className={styles.menuItemIcon} />
            {t('action.editType', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleEditColorClick}>
            <Icon name="dot circle outline" className={styles.menuItemIcon} />
            {t('action.editColor', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleAddCardClick}>
            <Icon name="list alternate outline" className={styles.menuItemIcon} />
            {t('action.addCard', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleSortClick}>
            <Icon name="sort amount down" className={styles.menuItemIcon} />
            {t('action.sortList', {
              context: 'title',
            })}
          </Menu.Item>
          {list.type === ListTypes.CLOSED && (
            <Menu.Item className={styles.menuItem} onClick={handleArchiveCardsClick}>
              <Icon name="folder open outline" className={styles.menuItemIcon} />
              {t('action.archiveCards', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
            <Icon name="trash alternate outline" className={styles.menuItemIcon} />
            {t('action.deleteList', {
              context: 'title',
            })}
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
