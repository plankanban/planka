import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import User from '../User';
import Label from '../Label';
import ProjectMembershipsPopup from '../ProjectMembershipsPopup';
import LabelsPopup from '../LabelsPopup';

import styles from './Filter.module.css';

const Filter = React.memo(
  ({
    users,
    labels,
    allProjectMemberships,
    allLabels,
    onUserAdd,
    onUserRemove,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelDelete,
  }) => {
    const [t] = useTranslation();

    const handleUserRemoveClick = useCallback(
      (id) => {
        onUserRemove(id);
      },
      [onUserRemove],
    );

    const handleLabelRemoveClick = useCallback(
      (id) => {
        onLabelRemove(id);
      },
      [onLabelRemove],
    );

    return (
      <div className={styles.filters}>
        <span className={styles.filter}>
          <ProjectMembershipsPopup
            items={allProjectMemberships}
            currentUserIds={users.map((user) => user.id)}
            title={t('common.filterByMembers', {
              context: 'title',
            })}
            onUserSelect={onUserAdd}
            onUserDeselect={onUserRemove}
          >
            <button type="button" className={styles.filterButton}>
              <span className={styles.filterTitle}>{`${t('common.members')}:`}</span>
              {users.length === 0 && <span className={styles.filterLabel}>{t('common.all')}</span>}
            </button>
          </ProjectMembershipsPopup>
          {users.map((user) => (
            <span key={user.id} className={styles.filterItem}>
              <User
                name={user.name}
                avatarUrl={user.avatarUrl}
                size="small"
                onClick={() => handleUserRemoveClick(user.id)}
              />
            </span>
          ))}
        </span>
        <span className={styles.filter}>
          <LabelsPopup
            items={allLabels}
            currentIds={labels.map((label) => label.id)}
            title={t('common.filterByLabels', {
              context: 'title',
            })}
            onSelect={onLabelAdd}
            onDeselect={onLabelRemove}
            onCreate={onLabelCreate}
            onUpdate={onLabelUpdate}
            onDelete={onLabelDelete}
          >
            <button type="button" className={styles.filterButton}>
              <span className={styles.filterTitle}>{`${t('common.labels')}:`}</span>
              {labels.length === 0 && <span className={styles.filterLabel}>{t('common.all')}</span>}
            </button>
          </LabelsPopup>
          {labels.map((label) => (
            <span key={label.id} className={styles.filterItem}>
              <Label
                name={label.name}
                color={label.color}
                size="small"
                onClick={() => handleLabelRemoveClick(label.id)}
              />
            </span>
          ))}
        </span>
      </div>
    );
  },
);

Filter.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  allProjectMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

export default Filter;
