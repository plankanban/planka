import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { withPopup } from '../../../lib/popup';
import { Popup } from '../../../lib/custom-ui';

import { useSteps } from '../../../hooks';
import NameEditStep from './NameEditStep';
import BackgroundEditStep from './BackgroundEditStep';
import DeleteStep from '../../DeleteStep';

import styles from './ActionsPopup.module.scss';

const StepTypes = {
  EDIT_NAME: 'EDIT_NAME',
  EDIT_BACKGROUND: 'EDIT_BACKGROUND',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(
  ({ project, onUpdate, onBackgroundImageUpdate, onDelete, onClose }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditNameClick = useCallback(() => {
      openStep(StepTypes.EDIT_NAME);
    }, [openStep]);

    const handleEditBackgroundClick = useCallback(() => {
      openStep(StepTypes.EDIT_BACKGROUND);
    }, [openStep]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleBackgroundUpdate = useCallback(
      (newBackground) => {
        onUpdate({
          background: newBackground,
        });
      },
      [onUpdate],
    );

    const handleBackgroundImageDelete = useCallback(() => {
      onUpdate({
        backgroundImage: null,
      });
    }, [onUpdate]);

    if (step) {
      if (step) {
        switch (step.type) {
          case StepTypes.EDIT_NAME:
            return (
              <NameEditStep
                defaultValue={project.name}
                onUpdate={handleNameUpdate}
                onBack={handleBack}
                onClose={onClose}
              />
            );
          case StepTypes.EDIT_BACKGROUND:
            return (
              <BackgroundEditStep
                defaultValue={project.background}
                imageCoverUrl={project.backgroundImage && project.backgroundImage.coverUrl}
                isImageUpdating={project.isBackgroundImageUpdating}
                onUpdate={handleBackgroundUpdate}
                onImageUpdate={onBackgroundImageUpdate}
                onImageDelete={handleBackgroundImageDelete}
                onBack={handleBack}
              />
            );
          case StepTypes.DELETE:
            return (
              <DeleteStep
                title={t('common.deleteProject', {
                  context: 'title',
                })}
                content={t('common.areYouSureYouWantToDeleteThisProject')}
                buttonContent={t('action.deleteProject')}
                onConfirm={onDelete}
                onBack={handleBack}
              />
            );
          default:
        }
      }
    }

    return (
      <>
        <Popup.Header>
          {t('common.projectActions', {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Menu secondary vertical className={styles.menu}>
            <Menu.Item className={styles.menuItem} onClick={handleEditNameClick}>
              {t('action.editTitle', {
                context: 'title',
              })}
            </Menu.Item>
            <Menu.Item className={styles.menuItem} onClick={handleEditBackgroundClick}>
              {t('action.editBackground', {
                context: 'title',
              })}
            </Menu.Item>
            <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
              {t('action.deleteProject', {
                context: 'title',
              })}
            </Menu.Item>
          </Menu>
        </Popup.Content>
      </>
    );
  },
);

ActionsStep.propTypes = {
  project: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onBackgroundImageUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ActionsStep);
