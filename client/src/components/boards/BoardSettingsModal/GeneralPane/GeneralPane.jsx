/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Tab } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { usePopupInClosableContext } from '../../../../hooks';
import EditInformation from './EditInformation';
import ConfirmationStep from '../../../common/ConfirmationStep';
import ProjectSelectStep from '../../Board/ProjectSelectStep';

import styles from './GeneralPane.module.scss';

const GeneralPane = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const board = useSelector((state) => selectBoardById(state, boardId));
  const [showProjectSelect, setShowProjectSelect] = useState(false);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteBoard(boardId));
  }, [boardId, dispatch]);

  const handleMoveToProjectClick = useCallback(() => {
    setShowProjectSelect(true);
  }, []);

  const handleProjectSelect = useCallback(
    (targetProjectId) => {
      dispatch(entryActions.moveBoardToProjectRequest(boardId, targetProjectId));
    },
    [boardId, dispatch],
  );

  const handleProjectSelectBack = useCallback(() => {
    setShowProjectSelect(false);
  }, []);

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  if (showProjectSelect) {
    return (
      <ProjectSelectStep
        currentProjectId={board.projectId}
        onSelect={handleProjectSelect}
        onBack={handleProjectSelectBack}
      />
    );
  }

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <EditInformation />
      <Divider horizontal section>
        <Header as="h4">
          {t('action.moveBoardToProject', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <div className={styles.action}>
        <Button className={styles.actionButton} onClick={handleMoveToProjectClick}>
          {t('action.moveBoardToProject', {
            context: 'title',
          })}
        </Button>
      </div>
      <Divider horizontal section>
        <Header as="h4">
          {t('common.dangerZone', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <div className={styles.action}>
        <ConfirmationPopup
          title="common.deleteBoard"
          content="common.areYouSureYouWantToDeleteThisBoard"
          buttonContent="action.deleteBoard"
          typeValue={board.name}
          typeContent="common.typeTitleToConfirm"
          onConfirm={handleDeleteConfirm}
        >
          <Button className={styles.actionButton}>
            {t(`action.deleteBoard`, {
              context: 'title',
            })}
          </Button>
        </ConfirmationPopup>
      </div>
    </Tab.Pane>
  );
});

export default GeneralPane;
