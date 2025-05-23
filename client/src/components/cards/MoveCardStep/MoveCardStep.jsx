/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Form } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm } from '../../../hooks';

import styles from './MoveCardStep.module.scss';

const MoveCardStep = React.memo(({ id, onBack, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const projectsToLists = useSelector(
    selectors.selectProjectsToListsWithEditorRightsForCurrentUser,
  );

  const card = useSelector((state) => selectCardById(state, id));
  const projectId = useSelector((state) => selectBoardById(state, card.boardId).projectId);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultPath = useMemo(
    () => ({
      projectId,
      boardId: card.boardId,
      listId: card.listId,
    }),
    [card.boardId, card.listId, projectId],
  );

  const [path, handleFieldChange] = useForm(() => ({
    projectId: null,
    boardId: null,
    listId: null,
    ...defaultPath,
  }));

  const selectedProject = useMemo(
    () => projectsToLists.find((project) => project.id === path.projectId) || null,
    [projectsToLists, path.projectId],
  );

  const selectedBoard = useMemo(
    () =>
      (selectedProject && selectedProject.boards.find((board) => board.id === path.boardId)) ||
      null,
    [selectedProject, path.boardId],
  );

  const selectedList = useMemo(
    () => (selectedBoard && selectedBoard.lists.find((list) => list.id === path.listId)) || null,
    [selectedBoard, path.listId],
  );

  const handleSubmit = useCallback(() => {
    if (selectedBoard.id !== defaultPath.boardId) {
      dispatch(entryActions.transferCard(id, selectedBoard.id, selectedList.id));
    } else if (selectedList.id !== defaultPath.listId) {
      dispatch(entryActions.moveCard(id, selectedList.id));
    }

    onClose();
  }, [id, onClose, dispatch, defaultPath, selectedBoard, selectedList]);

  const handleBoardIdChange = useCallback(
    (event, data) => {
      if (selectedProject.boards.find((board) => board.id === data.value).isFetching === null) {
        dispatch(entryActions.fetchBoard(data.value));
      }

      handleFieldChange(event, data);
    },
    [dispatch, handleFieldChange, selectedProject.boards],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.moveCard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.project')}</div>
          <Dropdown
            fluid
            selection
            name="projectId"
            options={projectsToLists.map((project) => ({
              text: project.name,
              value: project.id,
            }))}
            value={selectedProject && selectedProject.id}
            placeholder={
              projectsToLists.length === 0 ? t('common.noProjects') : t('common.selectProject')
            }
            disabled={projectsToLists.length === 0}
            className={styles.field}
            onChange={handleFieldChange}
          />
          {selectedProject && (
            <>
              <div className={styles.text}>{t('common.board')}</div>
              <Dropdown
                fluid
                selection
                name="boardId"
                options={selectedProject.boards.map((board) => ({
                  text: board.name,
                  value: board.id,
                }))}
                value={selectedBoard && selectedBoard.id}
                placeholder={
                  selectedProject.boards.length === 0
                    ? t('common.noBoards')
                    : t('common.selectBoard')
                }
                disabled={selectedProject.boards.length === 0}
                className={styles.field}
                onChange={handleBoardIdChange}
              />
            </>
          )}
          {selectedBoard && (
            <>
              <div className={styles.text}>{t('common.list')}</div>
              <Dropdown
                fluid
                selection
                name="listId"
                options={selectedBoard.lists.map((list) => ({
                  text: list.name || t(`common.${list.type}`),
                  value: list.id,
                  disabled: !list.isPersisted,
                }))}
                value={selectedList && selectedList.id}
                placeholder={
                  selectedBoard.isFetching === false && selectedBoard.lists.length === 0
                    ? t('common.noLists')
                    : t('common.selectList')
                }
                loading={selectedBoard.isFetching !== false}
                disabled={selectedBoard.isFetching !== false || selectedBoard.lists.length === 0}
                className={styles.field}
                onChange={handleFieldChange}
              />
            </>
          )}
          <Button
            positive
            content={t('action.move')}
            disabled={(selectedBoard && selectedBoard.isFetching !== false) || !selectedList}
          />
        </Form>
      </Popup.Content>
    </>
  );
});

MoveCardStep.propTypes = {
  id: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

MoveCardStep.defaultProps = {
  onBack: undefined,
};

export default MoveCardStep;
