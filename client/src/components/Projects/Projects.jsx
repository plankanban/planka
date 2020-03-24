import isUndefined from 'lodash/isUndefined';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container, Grid } from 'semantic-ui-react';

import Paths from '../../constants/Paths';
import ProjectWrapperContainer from '../../containers/ProjectWrapperContainer';
import { ReactComponent as PlusIcon } from '../../assets/images/plus-icon.svg';

import styles from './Projects.module.css';

const Projects = React.memo(({ items, currentId, isEditable, onAdd }) => {
  const [t] = useTranslation();

  if (isUndefined(currentId)) {
    return (
      <Container className={styles.cardsWrapper}>
        <Grid className={styles.gridFix}>
          {items.map((item) => (
            <Grid.Column key={item.id} mobile={8} computer={4}>
              <Link
                to={
                  item.firstBoardId
                    ? Paths.BOARDS.replace(':id', item.firstBoardId)
                    : Paths.PROJECTS.replace(':id', item.id)
                }
              >
                <div className={classNames(styles.card, styles.open)}>
                  {item.notificationsTotal > 0 && (
                    <span className={styles.notification}>{item.notificationsTotal}</span>
                  )}
                  <div className={styles.cardOverlay} />
                  <div className={styles.openTitle}>{item.name}</div>
                </div>
              </Link>
            </Grid.Column>
          ))}
          {isEditable && (
            <Grid.Column mobile={8} computer={4}>
              <button type="button" className={classNames(styles.card, styles.add)} onClick={onAdd}>
                <div className={styles.addTitleWrapper}>
                  <div className={styles.addTitle}>
                    <PlusIcon className={styles.addGridIcon} />
                    {t('action.createProject')}
                  </div>
                </div>
              </button>
            </Grid.Column>
          )}
        </Grid>
      </Container>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.project}>
        <ProjectWrapperContainer />
      </div>
    </div>
  );
});

Projects.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentId: PropTypes.string,
  isEditable: PropTypes.bool.isRequired,
  onAdd: PropTypes.func.isRequired,
};

Projects.defaultProps = {
  currentId: undefined,
};

export default Projects;
