/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Grid, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { isUserAdminOrProjectOwner } from '../../../utils/record-helpers';
import ProjectCard from '../../projects/ProjectCard';
import PlusIcon from '../../../assets/images/plus-icon.svg?react';

import styles from './Projects.module.scss';

const Projects = React.memo(({ ids, title, titleIcon, withTypeIndicator, onAdd }) => {
  const canAdd = useSelector((state) => {
    const user = selectors.selectCurrentUser(state);
    return isUserAdminOrProjectOwner(user);
  });

  const [t] = useTranslation();

  return (
    <div className={classNames(styles.wrapper, !title && styles.wrapperWithoutTitle)}>
      {title && (
        <div className={styles.title}>
          {titleIcon && <Icon name={titleIcon} className={styles.titleIcon} />}
          {t(title, {
            context: 'title',
          })}
        </div>
      )}
      <Grid>
        {ids.map((id) => (
          <Grid.Column key={id} className={styles.column}>
            <ProjectCard
              withDescription
              withFavoriteButton
              id={id}
              withTypeIndicator={withTypeIndicator}
              className={styles.card}
            />
          </Grid.Column>
        ))}
        {onAdd && canAdd && (
          <Grid.Column className={styles.column}>
            <button
              type="button"
              className={classNames(styles.card, styles.addButton)}
              onClick={onAdd}
            >
              <div className={styles.addButtonCover} />
              <div className={styles.addButtonTitleWrapper}>
                <div className={styles.addButtonTitle}>
                  <PlusIcon className={styles.addButtonTitleIcon} />
                  {t('action.createProject')}
                </div>
              </div>
            </button>
          </Grid.Column>
        )}
      </Grid>
    </div>
  );
});

Projects.propTypes = {
  ids: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  titleIcon: PropTypes.string,
  withTypeIndicator: PropTypes.bool, // TODO: use plural form?
  onAdd: PropTypes.func,
};

Projects.defaultProps = {
  title: undefined,
  titleIcon: undefined,
  withTypeIndicator: false,
  onAdd: undefined,
};

export default Projects;
