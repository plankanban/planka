import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container, Grid } from 'semantic-ui-react';

import Paths from '../../constants/Paths';
import { ProjectBackgroundTypes } from '../../constants/Enums';
import { ReactComponent as PlusIcon } from '../../assets/images/plus-icon.svg';

import styles from './Projects.module.scss';
import globalStyles from '../../styles.module.scss';

const Projects = React.memo(({ items, canAdd, onAdd }) => {
  const [t] = useTranslation();

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
              <div
                className={classNames(
                  styles.card,
                  styles.open,
                  item.background &&
                    item.background.type === ProjectBackgroundTypes.GRADIENT &&
                    globalStyles[`background${upperFirst(camelCase(item.background.name))}`],
                )}
                style={{
                  background:
                    item.background &&
                    item.background.type === 'image' &&
                    `url("${item.backgroundImage.coverUrl}") center / cover`,
                }}
              >
                {item.notificationsTotal > 0 && (
                  <span className={styles.notification}>{item.notificationsTotal}</span>
                )}
                <div className={styles.cardOverlay} />
                <div className={styles.openTitle}>{item.name}</div>
              </div>
            </Link>
          </Grid.Column>
        ))}
        {canAdd && (
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
});

Projects.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canAdd: PropTypes.bool.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default Projects;
