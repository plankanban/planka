import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { Loader } from 'semantic-ui-react';

import ModalTypes from '../../constants/ModalTypes';
import FixedContainer from '../../containers/FixedContainer';
import StaticContainer from '../../containers/StaticContainer';
import UsersModalContainer from '../../containers/UsersModalContainer';
import UserSettingsModalContainer from '../../containers/UserSettingsModalContainer';
import ProjectAddModalContainer from '../../containers/ProjectAddModalContainer';
import Background from '../Background';

import styles from './Core.module.scss';

const Core = React.memo(
  ({ isInitializing, isSocketDisconnected, currentModal, currentProject, currentBoard }) => {
    const [t] = useTranslation();

    const defaultTitle = useRef(document.title);

    useEffect(() => {
      let title;
      if (currentProject) {
        title = currentProject.name;

        if (currentBoard) {
          title += ` | ${currentBoard.name}`;
        }
      } else {
        title = defaultTitle.current;
      }

      document.title = title;
    }, [currentProject, currentBoard]);

    return (
      <>
        {isInitializing ? (
          <Loader active size="massive" />
        ) : (
          <>
            {currentProject && currentProject.background && (
              <Background
                type={currentProject.background.type}
                name={currentProject.background.name}
                imageUrl={currentProject.backgroundImage && currentProject.backgroundImage.url}
              />
            )}
            <FixedContainer />
            <StaticContainer />
            {currentModal === ModalTypes.USERS && <UsersModalContainer />}
            {currentModal === ModalTypes.USER_SETTINGS && <UserSettingsModalContainer />}
            {currentModal === ModalTypes.PROJECT_ADD && <ProjectAddModalContainer />}
          </>
        )}
        {isSocketDisconnected && (
          <div className={styles.message}>
            <div className={styles.messageHeader}>{t('common.noConnectionToServer')}</div>
            <div className={styles.messageContent}>
              <Trans i18nKey="common.allChangesWillBeAutomaticallySavedAfterConnectionRestored">
                All changes will be automatically saved
                <br />
                after connection restored
              </Trans>
            </div>
          </div>
        )}
      </>
    );
  },
);

Core.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
  isSocketDisconnected: PropTypes.bool.isRequired,
  currentModal: PropTypes.oneOf(Object.values(ModalTypes)),
  /* eslint-disable react/forbid-prop-types */
  currentProject: PropTypes.object,
  currentBoard: PropTypes.object,
  /* eslint-enable react/forbid-prop-types */
};

Core.defaultProps = {
  currentModal: undefined,
  currentProject: undefined,
  currentBoard: undefined,
};

export default Core;
