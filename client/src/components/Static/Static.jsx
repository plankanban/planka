import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import ProjectsContainer from '../../containers/ProjectsContainer';
import BoardWrapperContainer from '../../containers/BoardWrapperContainer';

import styles from './Static.module.scss';

const Static = ({ cardId, boardId, projectId }) => {
  const [t] = useTranslation();

  if (projectId === undefined) {
    return (
      <div className={styles.root}>
        <ProjectsContainer />
      </div>
    );
  }

  if (cardId === null) {
    return (
      <div className={classNames(styles.root, styles.flex)}>
        <div className={styles.message}>
          <h1>
            {t('common.cardNotFound', {
              context: 'title',
            })}
          </h1>
        </div>
      </div>
    );
  }

  if (boardId === null) {
    return (
      <div className={classNames(styles.root, styles.flex)}>
        <div className={styles.message}>
          <h1>
            {t('common.boardNotFound', {
              context: 'title',
            })}
          </h1>
        </div>
      </div>
    );
  }

  if (projectId === null) {
    return (
      <div className={classNames(styles.root, styles.flex)}>
        <div className={styles.message}>
          <h1>
            {t('common.projectNotFound', {
              context: 'title',
            })}
          </h1>
        </div>
      </div>
    );
  }

  if (boardId === undefined) {
    return (
      <div className={classNames(styles.board, styles.flex)}>
        <div className={styles.message}>
          <Icon inverted name="hand point up outline" size="huge" className={styles.messageIcon} />
          <h1 className={styles.messageTitle}>
            {t('common.openBoard', {
              context: 'title',
            })}
          </h1>
          <div className={styles.messageContent}>
            <Trans i18nKey="common.createNewOneOrSelectExistingOne" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(styles.board, styles.flex)}>
      <BoardWrapperContainer />
    </div>
  );
};

Static.propTypes = {
  cardId: PropTypes.string,
  boardId: PropTypes.string,
  projectId: PropTypes.string,
};

Static.defaultProps = {
  cardId: undefined,
  boardId: undefined,
  projectId: undefined,
};

export default Static;
