/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Radio, Tab } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { usePopupInClosableContext } from '../../../../hooks';
import EditInformation from './EditInformation';
import ConfirmationStep from '../../../common/ConfirmationStep';

import styles from './GeneralPane.module.scss';

const GeneralPane = React.memo(() => {
  const project = useSelector(selectors.selectCurrentProject);

  const hasBoards = useSelector(
    (state) => selectors.selectBoardIdsForCurrentProject(state).length > 0,
  );

  const canEdit = useSelector(selectors.selectIsCurrentUserManagerForCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleToggleChange = useCallback(
    (_, { name: fieldName, checked }) => {
      dispatch(
        entryActions.updateCurrentProject({
          [fieldName]: checked,
        }),
      );
    },
    [dispatch],
  );

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteCurrentProject());
  }, [dispatch]);

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      {canEdit && (
        <>
          <EditInformation />
          <Divider horizontal section>
            <Header as="h4">
              {t('common.display', {
                context: 'title',
              })}
            </Header>
          </Divider>
        </>
      )}
      <Radio
        toggle
        name="isHidden"
        checked={project.isHidden}
        label={t('common.hideFromProjectListAndFavorites')}
        className={styles.radio}
        onChange={handleToggleChange}
      />
      {canEdit && (
        <>
          <Divider horizontal section>
            <Header as="h4">
              {t('common.dangerZone', {
                context: 'title',
              })}
            </Header>
          </Divider>
          <div className={styles.action}>
            <ConfirmationPopup
              title="common.deleteProject"
              content="common.areYouSureYouWantToDeleteThisProject"
              buttonContent="action.deleteProject"
              onConfirm={handleDeleteConfirm}
            >
              <Button disabled={hasBoards} className={styles.actionButton}>
                {hasBoards
                  ? t('common.deleteAllBoardsToBeAbleToDeleteThisProject')
                  : t('action.deleteProject', {
                      context: 'title',
                    })}
              </Button>
            </ConfirmationPopup>
          </div>
        </>
      )}
    </Tab.Pane>
  );
});

export default GeneralPane;
