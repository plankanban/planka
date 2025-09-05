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

import styles from './MoveStep.module.scss';

const MoveStep = React.memo(({ id, onBack, onClose }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const projectsToBoards = useSelector(
    selectors.selectProjectsToBoardsWithEditorRightsForCurrentUser,
  );

  const list = useSelector((state) => selectListById(state, id));
  const projectId = useSelector((state) => selectBoardById(state, list.boardId).projectId);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultPath = useMemo(
    () => ({
      projectId,
      boardId: list.boardId,
    }),
    [list.boardId, projectId],
  );

  const [path, handleFieldChange] = useForm(() => ({
    projectId: null,
    boardId: null,
    ...defaultPath,
  }));

  const selectedProject = useMemo(
    () => projectsToBoards.find((project) => project.id === path.projectId) || null,
    [projectsToBoards, path.projectId],
  );

  const selectedBoard = useMemo(
    () =>
      (selectedProject && selectedProject.boards.find((board) => board.id === path.boardId)) ||
      null,
    [selectedProject, path.boardId],
  );

  const handleSubmit = useCallback(() => {
    if (selectedBoard.id !== defaultPath.boardId) {
      dispatch(entryActions.transferList(id, selectedBoard.id));
    }

    onClose();
  }, [id, onClose, dispatch, defaultPath, selectedBoard]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.moveList', {
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
            options={projectsToBoards.map((project) => ({
              text: project.name,
              value: project.id,
            }))}
            value={selectedProject && selectedProject.id}
            placeholder={
              projectsToBoards.length === 0 ? t('common.noProjects') : t('common.selectProject')
            }
            disabled={projectsToBoards.length === 0}
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
                onChange={handleFieldChange}
              />
            </>
          )}
          <Button positive content={t('action.move')} disabled={!selectedBoard} />
        </Form>
      </Popup.Content>
    </>
  );
});

MoveStep.propTypes = {
  id: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

MoveStep.defaultProps = {
  onBack: undefined,
};

export default MoveStep;
