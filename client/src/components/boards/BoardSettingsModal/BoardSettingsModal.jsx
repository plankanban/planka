/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import GeneralPane from './GeneralPane';
import PreferencesPane from './PreferencesPane';
import NotificationsPane from './NotificationsPane';

import styles from './BoardSettingsModal.module.scss';

const BoardSettingsModal = React.memo(() => {
  const openPreferences = useSelector(
    (state) => selectors.selectCurrentModal(state).params.openPreferences,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const [ClosableModal] = useClosableModal();

  const panes = [
    {
      menuItem: t('common.general', {
        context: 'title',
      }),
      render: () => <GeneralPane />,
    },
    {
      menuItem: t('common.preferences', {
        context: 'title',
      }),
      render: () => <PreferencesPane />,
    },
    {
      menuItem: t('common.notifications', {
        context: 'title',
      }),
      render: () => <NotificationsPane />,
    },
  ];

  return (
    <ClosableModal closeIcon size="small" centered={false} onClose={handleClose}>
      <ClosableModal.Content>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
          }}
          panes={panes}
          defaultActiveIndex={openPreferences ? 1 : undefined}
        />
        <div className={styles.actions}>
          <Button positive content="OK" onClick={handleClose} />
        </div>
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default BoardSettingsModal;
