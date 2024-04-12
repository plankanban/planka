import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { Input, Popup } from '../../lib/custom-ui';

import { useSteps } from '../../hooks';
import User from '../User';
import Label from '../Label';
import BoardMembershipsStep from '../BoardMembershipsStep';
import LabelsStep from '../LabelsStep';

import styles from './FiltersStep.module.scss';

const StepTypes = {
  MEMBERS: 'MEMBERS',
  LABELS: 'LABELS',
};

const FiltersStep = React.memo(
  ({
    keyword,
    users,
    labels,
    allBoardMemberships,
    allLabels,
    title,
    canEdit,
    onKeywordUpdate,
    onUserAdd,
    onUserRemove,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
    onBack,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleKeywordChange = useCallback(
      (newValue) => {
        onKeywordUpdate(newValue);
      },
      [onKeywordUpdate],
    );

    const handleRemoveUserClick = useCallback(
      (id) => {
        onUserRemove(id);
      },
      [onUserRemove],
    );

    const handleRemoveLabelClick = useCallback(
      (id) => {
        onLabelRemove(id);
      },
      [onLabelRemove],
    );

    if (step) {
      switch (step.type) {
        case StepTypes.MEMBERS:
          return (
            <BoardMembershipsStep
              items={allBoardMemberships}
              currentUserIds={users.map((user) => user.id)}
              title="common.filterByMembers"
              onUserSelect={onUserAdd}
              onUserDeselect={onUserRemove}
              onBack={handleBack}
            />
          );
        case StepTypes.LABELS:
          return (
            <LabelsStep
              items={allLabels}
              currentIds={labels.map((label) => label.id)}
              title="common.filterByLabels"
              canEdit={canEdit}
              onSelect={onLabelAdd}
              onDeselect={onLabelRemove}
              onCreate={onLabelCreate}
              onUpdate={onLabelUpdate}
              onMove={onLabelMove}
              onDelete={onLabelDelete}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content className={styles.container}>
          <span className={styles.filter}>
            <div className={styles.filterTitle}>{t('common.keyword')}</div>
            <Input
              fluid
              placeholder={t('common.enterKeyword')}
              icon="search"
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
            />
          </span>
          <span className={styles.filter}>
            <div className={styles.filterTitle}>{t('common.members')}</div>
            {users.slice(0, 5).map((user) => (
              <span key={user.id} className={styles.filterItem}>
                <User
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  size="tiny"
                  onClick={() => handleRemoveUserClick(user.id)}
                />
              </span>
            ))}
            <button
              type="button"
              className={styles.filterButton}
              onClick={() => openStep(StepTypes.MEMBERS)}
            >
              <span className={styles.filterLabel}>
                {users.length === 0 ? t('common.all') : <Icon name="plus" />}
              </span>
            </button>
          </span>
          <span className={styles.filter}>
            <div className={styles.filterTitle}>{t('common.labels')}</div>
            {labels.slice(0, 5).map((label) => (
              <span key={label.id} className={styles.filterItem}>
                <Label
                  name={label.name}
                  color={label.color}
                  size="small"
                  onClick={() => handleRemoveLabelClick(label.id)}
                />
              </span>
            ))}
            <button
              type="button"
              className={styles.filterButton}
              onClick={() => openStep(StepTypes.LABELS)}
            >
              <span className={styles.filterLabel}>
                {labels.length === 0 ? t('common.all') : <Icon name="plus" />}
              </span>
            </button>
          </span>
        </Popup.Content>
      </>
    );
  },
);

FiltersStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  keyword: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  title: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onKeywordUpdate: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

FiltersStep.defaultProps = {
  title: 'common.filters_title',
  onBack: undefined,
};

export default FiltersStep;
