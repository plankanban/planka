/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import { useTranslation, Trans } from 'react-i18next';
import { Loader, Message as UIMessage } from 'semantic-ui-react';

import Config from '../../../constants/Config';
import selectors from '../../../selectors';
import version from '../../../version';
import ModalTypes from '../../../constants/ModalTypes';
import Message from './Message';
import Toaster from '../Toaster';
import Fixed from '../Fixed';
import Static from '../Static';
import AdministrationModal from '../AdministrationModal';
import AboutModal from '../AboutModal';
import UserSettingsModal from '../../users/UserSettingsModal';
import ProjectBackground from '../../projects/ProjectBackground';
import AddProjectModal from '../../projects/AddProjectModal';
import KanbanBoard from '../KanbanBoard';
import styles from './PublicBoard.module.scss';

const Core = React.memo(() => {
  const location = useLocation();
  const { publicId } = useParams();

  // Check if current route is for a public board
  const isPublicBoardRoute = useMemo(() => {
    const publicBoardPattern = /^\/public-boards\/[^/]+$/;
    return publicBoardPattern.test(location.pathname);
  }, [location.pathname]);

  // Public board state
  const [publicBoardData, setPublicBoardData] = useState(null);
  const [isPublicBoardLoading, setIsPublicBoardLoading] = useState(false);
  const [publicBoardError, setPublicBoardError] = useState(null);

  // Fetch public board data
  useEffect(() => {
    if (!isPublicBoardRoute || !publicId) return;

    const fetchPublicBoard = async () => {
      setIsPublicBoardLoading(true);
      setPublicBoardError(null);
      try {
        const response = await fetch(`${Config.SERVER_BASE_URL}/api/public-boards/${publicId}`);
        if (!response.ok) {
          throw new Error('Board not found or not public');
        }
        const data = await response.json();
        setPublicBoardData(data);
      } catch (err) {
        setPublicBoardError(err.message);
      } finally {
        setIsPublicBoardLoading(false);
      }
    };

    fetchPublicBoard();
  }, [publicId, isPublicBoardRoute]);

  // Render public board
  if (isPublicBoardRoute) {
    if (isPublicBoardLoading) {
      return (
        <div className={styles.wrapper}>
          <Loader active size="massive" />
        </div>
      );
    }

    if (publicBoardError) {
      return (
        <div className={styles.wrapper}>
          <UIMessage error>
            <UIMessage.Header>Board Not Available</UIMessage.Header>
            <p>{publicBoardError}</p>
          </UIMessage>
        </div>
      );
    }

    if (!publicBoardData) {
      return null;
    }

    const { item: board, included } = publicBoardData;

    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.boardName}>{board.name}</h1>
          <div className={styles.badge}>Read Only - Public View</div>
        </div>
        <div className={styles.content}>
          <KanbanBoard board={board} included={included} isPublic />
        </div>
      </div>
    );
  }

  // Authenticated user section
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

  const defaultTitleRef = useRef(document.title);

  const handleRefreshPageClick = useCallback(() => {
    window.location.reload(true);
  }, []);

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
        <>
          <Toaster />
          {project && project.backgroundType && <ProjectBackground />}
          <Fixed />
          <Static />
          {modalNode}
        </>
      )}
      {messageNode}
    </>
  );
});

export default Core;
