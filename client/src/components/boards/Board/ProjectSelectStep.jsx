import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createSelector } from 'reselect';
import PopupHeader from '../../../lib/custom-ui/components/Popup/PopupHeader';
import styles from './ProjectSelectStep.module.scss';
import selectors from '../../../selectors';

const makeSelectProjectsByIds = () =>
  createSelector(
    (state, projectIds) => projectIds,
    (state) => state,
    (projectIds, state) => projectIds.map((id) => selectors.selectProjectById(state, id)),
  );

function ProjectSelectStep({ currentProjectId, onSelect, onBack, onClose }) {
  const [t] = useTranslation();
  const projectIds = useSelector((state) => selectors.selectProjectIdsForCurrentUser(state));
  const selectProjectsByIds = useMemo(makeSelectProjectsByIds, []);
  const projects = useSelector((state) => selectProjectsByIds(state, projectIds));

  return (
    <div className={styles.projectSelectStep}>
      <PopupHeader onBack={onBack} onClose={onClose}>
        {t('action.moveBoardToProject', { context: 'title' })}
      </PopupHeader>
      <div className={styles.menu}>
        {projects
          .filter((p) => p && p.id !== currentProjectId)
          .map((project) => (
            <button
              key={project.id}
              type="button"
              className={styles.projectButton}
              onClick={() => onSelect(project.id)}
            >
              {project.name}
            </button>
          ))}
        {projects.filter((p) => p && p.id !== currentProjectId).length === 0 && (
          <div className={styles.noProjects}>{t('common.noOtherProjects')}</div>
        )}
      </div>
    </div>
  );
}

ProjectSelectStep.propTypes = {
  currentProjectId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

ProjectSelectStep.defaultProps = {
  onClose: undefined,
};

export default ProjectSelectStep;
