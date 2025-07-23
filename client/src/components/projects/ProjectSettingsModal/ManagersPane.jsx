/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { usePopupInClosableContext } from '../../../hooks';
import ConfirmationStep from '../../common/ConfirmationStep';
import ProjectManagers from '../../project-managers/ProjectManagers';

import styles from './ManagersPane.module.scss';

const ManagersPane = React.memo(() => {
  const projectManagers = useSelector(selectors.selectManagersForCurrentProject);

  // TODO: rename?
  const isShared = useSelector(
    (state) => !selectors.selectCurrentProject(state).ownerProjectManagerId,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const firstProjectManager = projectManagers[0];

  const handleToggleSharedConfirm = useCallback(() => {
    dispatch(
      entryActions.updateCurrentProject({
        ownerProjectManagerId: isShared ? firstProjectManager.id : null,
      }),
    );
  }, [firstProjectManager, isShared, dispatch]);

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  let toggleSharedButtonContent;
  if (isShared) {
    toggleSharedButtonContent =
      projectManagers.length === 1
        ? t('action.makeProjectPrivate', {
            context: 'title',
          })
        : t('common.onlyOneManagerShouldRemainToMakeThisProjectPrivate');
  } else {
    toggleSharedButtonContent = t('action.makeProjectShared', {
      context: 'title',
    });
  }

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <ProjectManagers />
      <Divider horizontal section>
        <Header as="h4">
          {t('common.dangerZone', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <div className={styles.action}>
        <ConfirmationPopup
          title={isShared ? 'common.makeProjectPrivate' : 'common.makeProjectShared'}
          content={
            isShared
              ? 'common.areYouSureYouWantToMakeThisProjectPrivate'
              : 'common.areYouSureYouWantToMakeThisProjectShared'
          }
          buttonType="positive"
          buttonContent={isShared ? 'action.makeProjectPrivate' : 'action.makeProjectShared'}
          onConfirm={handleToggleSharedConfirm}
        >
          <Button
            disabled={isShared && projectManagers.length !== 1}
            className={styles.actionButton}
          >
            {toggleSharedButtonContent}
          </Button>
        </ConfirmationPopup>
      </div>
    </Tab.Pane>
  );
});

export default ManagersPane;
