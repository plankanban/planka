/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { Loader } from 'semantic-ui-react';

import selectors from '../../../selectors';
import version from '../../../version';
import ModalTypes from '../../../constants/ModalTypes';
import { SidebarContext } from '../../../contexts';
import { useTheme } from '../../../hooks';
import { resolveTheme, subscribeToThemeChange } from '../../../utils/theme-storage';
import Message from './Message';
import Toaster from '../Toaster';
import Fixed from '../Fixed';
import Sidebar from '../Sidebar';
import Static from '../Static';
import AdministrationModal from '../AdministrationModal';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal';
import AboutModal from '../AboutModal';
import AutoLogoutWarningModal from '../AutoLogoutWarningModal';
import UserSettingsModal from '../../users/UserSettingsModal';
import ProjectBackground from '../../projects/ProjectBackground';
import AddProjectModal from '../../projects/AddProjectModal';

const Core = React.memo(() => {
  const isInitializing = useSelector(selectors.selectIsInitializing);
  const isSocketDisconnected = useSelector(selectors.selectIsSocketDisconnected);
  const modal = useSelector(selectors.selectCurrentModal);
  const project = useSelector(selectors.selectCurrentProject);
  const board = useSelector(selectors.selectCurrentBoard);
  const currentUserId = useSelector(selectors.selectCurrentUserId);

  // TODO: move to selector?
  const isNewVersionAvailable = useSelector((state) => {
    const bootstrap = selectors.selectBootstrap(state);
    return !!bootstrap && bootstrap.version !== version;
  });

  const [t] = useTranslation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme] = useTheme();

  const sidebarContextValue = useMemo(
    () => [isSidebarOpen, setIsSidebarOpen],
    [isSidebarOpen, setIsSidebarOpen],
  );

  const defaultTitleRef = useRef(document.title);

  const handleRefreshPageClick = useCallback(() => {
    window.location.reload(true);
  }, []);

  // The page follows the user's theme, and the system's while that is the choice
  useEffect(() => {
    const { dataset } = document.documentElement;

    const applyTheme = () => {
      dataset.theme = resolveTheme(theme);
    };

    applyTheme();
    const unsubscribe = subscribeToThemeChange(applyTheme);

    return () => {
      unsubscribe();
      delete dataset.theme;
    };
  }, [theme]);

  useEffect(() => {
    const titleParts = [];
    if (project) {
      if (board) {
        titleParts.push(board.name);
      }

      titleParts.push(project.name);
    }

    document.title = titleParts.length === 0 ? defaultTitleRef.current : titleParts.join(' | ');
  }, [project, board]);

  let modalNode = null;
  if (modal) {
    switch (modal.type) {
      case ModalTypes.ADMINISTRATION:
        modalNode = <AdministrationModal />;

        break;
      case ModalTypes.KEYBOARD_SHORTCUTS:
        modalNode = <KeyboardShortcutsModal />;

        break;
      case ModalTypes.ABOUT:
        modalNode = <AboutModal />;

        break;
      case ModalTypes.USER_SETTINGS:
        modalNode = <UserSettingsModal />;

        break;
      case ModalTypes.ADD_PROJECT:
        modalNode = <AddProjectModal />;

        break;
      default:
    }
  }

  let messageNode = null;
  if (isSocketDisconnected) {
    messageNode = (
      <Message
        type="error"
        header={t('common.noConnectionToServer')}
        content={
          <Trans i18nKey="common.allChangesWillBeAutomaticallySavedAfterConnectionRestored">
            All changes will be automatically saved
            <br />
            after connection restored
          </Trans>
        }
      />
    );
  } else if (isNewVersionAvailable) {
    messageNode = (
      <Message
        type="info"
        header={t('common.newVersionAvailable')}
        content={
          <Trans i18nKey="common.clickHereOrRefreshPageToUpdate">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid,
                                         jsx-a11y/click-events-have-key-events,
                                         jsx-a11y/no-static-element-interactions */}
            <a onClick={handleRefreshPageClick}>Click here</a> or refresh the page to update
          </Trans>
        }
      />
    );
  }

  return (
    <>
      {isInitializing || !currentUserId ? (
        <Loader active size="massive" />
      ) : (
        <SidebarContext.Provider value={sidebarContextValue}>
          <Toaster />
          {project && project.backgroundType && <ProjectBackground />}
          <Sidebar />
          <Fixed />
          <Static />
          {modalNode}
          <AutoLogoutWarningModal />
        </SidebarContext.Provider>
      )}
      {messageNode}
    </>
  );
});

export default Core;
