/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import GeneralPane from './GeneralPane';
import ManagersPane from './ManagersPane';
import BackgroundPane from './BackgroundPane';
import BaseCustomFieldGroupsPane from './BaseCustomFieldGroupsPane';

import styles from './ProjectSettingsModal.module.scss';

const ProjectSettingsModal = React.memo(() => {
  const withManagablePanes = useSelector(selectors.selectIsCurrentUserManagerForCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const handleTabChange = useCallback((_, { activeIndex }) => {
    setActiveTabIndex(activeIndex);
  }, []);

  const [ClosableModal] = useClosableModal();

  const panes = [
    {
      menuItem: t('common.general', {
        context: 'title',
      }),
      render: () => <GeneralPane />,
    },
    {
      menuItem: t('common.managers', {
        context: 'title',
      }),
      render: () => <ManagersPane />,
    },
  ];

  if (withManagablePanes) {
    panes.push(
      {
        menuItem: t('common.background', {
          context: 'title',
        }),
        render: () => <BackgroundPane />,
      },
      {
        menuItem: t('common.baseCustomFields', {
          context: 'title',
        }),
        render: () => <BaseCustomFieldGroupsPane />,
      },
    );
  }

  const isBackgroundPaneActive = withManagablePanes && activeTabIndex === 2;

  return (
    <ClosableModal
      closeIcon
      size="small"
      centered={false}
      dimmer={isBackgroundPaneActive && { className: styles.dimmerTransparent }}
      onClose={handleClose}
    >
      <ClosableModal.Content>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
          }}
          panes={panes}
          onTabChange={handleTabChange}
        />
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default ProjectSettingsModal;
