/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Menu, Icon } from 'semantic-ui-react';
import { useSteps } from '../../../hooks';
import selectors from '../../../selectors';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './ProjectCardMenu.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const ProjectCardMenu = React.memo(({ projectId, onDeleteConfirm, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const selectProjectById = useMemo(() => selectors.makeSelectProjectById(), []);
  const project = useSelector((state) => selectProjectById(state, projectId));

  const handleDeleteClick = useCallback(
    (event) => {
      event.stopPropagation();
      openStep(StepTypes.DELETE);
    },
    [openStep],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (onDeleteConfirm) {
      onDeleteConfirm();
    }
    if (onClose) {
      onClose();
    }
  }, [onDeleteConfirm, onClose]);

  if (step) {
    switch (step.type) {
      case StepTypes.DELETE:
        if (!project) {
          return null;
        }
        return (
          <ConfirmationStep
            title="common.deleteProject"
            content="common.areYouSureYouWantToDeleteThisProject"
            buttonContent="action.deleteProject"
            typeValue={project.name}
            typeContent="common.typeTitleToConfirm"
            onConfirm={handleDeleteConfirm}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <Menu secondary vertical className={styles.menu}>
      <Menu.Item
        className={classNames(styles.menuItem, styles.menuItemDelete)}
        onClick={handleDeleteClick}
      >
        <Icon name="trash alternate outline" className={styles.menuItemIcon} />
        {t('action.deleteProject', {
          context: 'title',
        })}
      </Menu.Item>
    </Menu>
  );
});

ProjectCardMenu.propTypes = {
  projectId: PropTypes.string.isRequired,
  onDeleteConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

ProjectCardMenu.defaultProps = {
  onClose: undefined,
};

export default ProjectCardMenu;
