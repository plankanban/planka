import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal } from 'semantic-ui-react';
import { Markdown } from '../../lib/custom-ui';

import NameField from './NameField';
import EditDescription from './EditDescription';
import Tasks from './Tasks';
import Actions from './Actions';
import User from '../User';
import Label from '../Label';
import DueDate from '../DueDate';
import Timer from '../Timer';
import ProjectMembershipsPopup from '../ProjectMembershipsPopup';
import LabelsPopup from '../LabelsPopup';
import EditDueDatePopup from '../EditDueDatePopup';
import EditTimerPopup from '../EditTimerPopup';
import DeletePopup from '../DeletePopup';

import styles from './CardModal.module.css';

const CardModal = React.memo(
  ({
    name,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActionsFetching,
    isAllActionsFetched,
    users,
    labels,
    tasks,
    actions,
    allProjectMemberships,
    allLabels,
    isEditable,
    onUpdate,
    onDelete,
    onUserAdd,
    onUserRemove,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelDelete,
    onTaskCreate,
    onTaskUpdate,
    onTaskDelete,
    onActionsFetch,
    onCommentActionCreate,
    onCommentActionUpdate,
    onCommentActionDelete,
    onClose,
  }) => {
    const [t] = useTranslation();

    const handleNameUpdate = useCallback(
      newName => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleDescriptionUpdate = useCallback(
      newDescription => {
        onUpdate({
          description: newDescription,
        });
      },
      [onUpdate],
    );

    const handleDueDateUpdate = useCallback(
      newDueDate => {
        onUpdate({
          dueDate: newDueDate,
        });
      },
      [onUpdate],
    );

    const handleTimerUpdate = useCallback(
      newTimer => {
        onUpdate({
          timer: newTimer,
        });
      },
      [onUpdate],
    );

    const handleToggleSubscribeClick = useCallback(() => {
      onUpdate({
        isSubscribed: !isSubscribed,
      });
    }, [isSubscribed, onUpdate]);

    const userIds = users.map(user => user.id);
    const labelIds = labels.map(label => label.id);

    return (
      <Modal open closeIcon size="small" centered={false} onClose={onClose}>
        <Grid className={styles.grid}>
          <Grid.Row className={styles.headerPadding}>
            <Grid.Column width={16} className={styles.headerPadding}>
              <div className={styles.headerWrapper}>
                <Icon name="list alternate outline" className={styles.moduleIcon} />
                <div className={styles.headerTitle}>
                  <NameField defaultValue={name} onUpdate={handleNameUpdate} />
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row className={styles.modalPadding}>
            <Grid.Column width={12} className={styles.contentPadding}>
              {(users.length > 0 || labels.length > 0 || dueDate || timer) && (
                <div className={styles.moduleWrapper}>
                  {users.length > 0 && (
                    <div className={styles.attachments}>
                      <div className={styles.text}>
                        {t('common.members', {
                          context: 'title',
                        })}
                      </div>
                      {users.map(user => (
                        <span key={user.id} className={styles.attachment}>
                          <ProjectMembershipsPopup
                            items={allProjectMemberships}
                            currentUserIds={userIds}
                            onUserSelect={onUserAdd}
                            onUserDeselect={onUserRemove}
                          >
                            <User name={user.name} avatar={user.avatar} />
                          </ProjectMembershipsPopup>
                        </span>
                      ))}
                      <ProjectMembershipsPopup
                        items={allProjectMemberships}
                        currentUserIds={userIds}
                        onUserSelect={onUserAdd}
                        onUserDeselect={onUserRemove}
                      >
                        <button
                          type="button"
                          className={classNames(styles.attachment, styles.dueDate)}
                        >
                          <Icon name="add" size="small" className={styles.addAttachment} />
                        </button>
                      </ProjectMembershipsPopup>
                    </div>
                  )}
                  {labels.length > 0 && (
                    <div className={styles.attachments}>
                      <div className={styles.text}>
                        {t('common.labels', {
                          context: 'title',
                        })}
                      </div>
                      {labels.map(label => (
                        <span key={label.id} className={styles.attachment}>
                          <LabelsPopup
                            key={label.id}
                            items={allLabels}
                            currentIds={labelIds}
                            onSelect={onLabelAdd}
                            onDeselect={onLabelRemove}
                            onCreate={onLabelCreate}
                            onUpdate={onLabelUpdate}
                            onDelete={onLabelDelete}
                          >
                            <Label name={label.name} color={label.color} />
                          </LabelsPopup>
                        </span>
                      ))}
                      <LabelsPopup
                        items={allLabels}
                        currentIds={labelIds}
                        onSelect={onLabelAdd}
                        onDeselect={onLabelRemove}
                        onCreate={onLabelCreate}
                        onUpdate={onLabelUpdate}
                        onDelete={onLabelDelete}
                      >
                        <button
                          type="button"
                          className={classNames(styles.attachment, styles.dueDate)}
                        >
                          <Icon name="add" size="small" className={styles.addAttachment} />
                        </button>
                      </LabelsPopup>
                    </div>
                  )}
                  {dueDate && (
                    <div className={styles.attachments}>
                      <div className={styles.text}>
                        {t('common.dueDate', {
                          context: 'title',
                        })}
                      </div>
                      <span className={styles.attachment}>
                        <EditDueDatePopup defaultValue={dueDate} onUpdate={handleDueDateUpdate}>
                          <DueDate value={dueDate} />
                        </EditDueDatePopup>
                      </span>
                    </div>
                  )}
                  {timer && (
                    <div className={styles.attachments}>
                      <div className={styles.text}>
                        {t('common.timer', {
                          context: 'title',
                        })}
                      </div>
                      <span className={styles.attachment}>
                        <EditTimerPopup defaultValue={timer} onUpdate={handleTimerUpdate}>
                          <Timer startedAt={timer.startedAt} total={timer.total} />
                        </EditTimerPopup>
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className={styles.contentModule}>
                <div className={styles.moduleWrapper}>
                  <Icon name="align justify" className={styles.moduleIcon} />
                  <div className={styles.moduleHeader}>{t('common.description')}</div>
                  <EditDescription defaultValue={description} onUpdate={handleDescriptionUpdate}>
                    {description ? (
                      <button type="button" className={styles.descriptionText}>
                        <Markdown linkStopPropagation source={description} linkTarget="_blank" />
                      </button>
                    ) : (
                      <button type="button" className={styles.descriptionButton}>
                        <span className={styles.descriptionButtonText}>
                          {t('action.addMoreDetailedDescription')}
                        </span>
                      </button>
                    )}
                  </EditDescription>
                </div>
              </div>
              <div className={styles.contentModule}>
                <div className={styles.moduleWrapper}>
                  <Icon name="check square outline" className={styles.moduleIcon} />
                  <div className={styles.moduleHeader}>{t('common.tasks')}</div>
                  <Tasks
                    items={tasks}
                    onCreate={onTaskCreate}
                    onUpdate={onTaskUpdate}
                    onDelete={onTaskDelete}
                  />
                </div>
              </div>
              <Actions
                items={actions}
                isFetching={isActionsFetching}
                isAllFetched={isAllActionsFetched}
                isEditable={isEditable}
                onFetch={onActionsFetch}
                onCommentCreate={onCommentActionCreate}
                onCommentUpdate={onCommentActionUpdate}
                onCommentDelete={onCommentActionDelete}
              />
            </Grid.Column>
            <Grid.Column width={4} className={styles.sidebarPadding}>
              <div className={styles.actions}>
                <span className={styles.actionsTitle}>{t('action.addToCard')}</span>
                <ProjectMembershipsPopup
                  items={allProjectMemberships}
                  currentUserIds={userIds}
                  onUserSelect={onUserAdd}
                  onUserDeselect={onUserRemove}
                >
                  <Button fluid className={styles.actionButton}>
                    <Icon name="user outline" className={styles.actionIcon} />
                    {t('common.members')}
                  </Button>
                </ProjectMembershipsPopup>
                <LabelsPopup
                  items={allLabels}
                  currentIds={labelIds}
                  onSelect={onLabelAdd}
                  onDeselect={onLabelRemove}
                  onCreate={onLabelCreate}
                  onUpdate={onLabelUpdate}
                  onDelete={onLabelDelete}
                >
                  <Button fluid className={styles.actionButton}>
                    <Icon name="bookmark outline" className={styles.actionIcon} />
                    {t('common.labels')}
                  </Button>
                </LabelsPopup>
                <EditDueDatePopup defaultValue={dueDate} onUpdate={handleDueDateUpdate}>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="calendar check outline" className={styles.actionIcon} />
                    {t('common.dueDate')}
                  </Button>
                </EditDueDatePopup>
                <EditTimerPopup defaultValue={timer} onUpdate={handleTimerUpdate}>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="clock outline" className={styles.actionIcon} />
                    {t('common.timer')}
                  </Button>
                </EditTimerPopup>
              </div>
              <div className={styles.actions}>
                <span className={styles.actionsTitle}>{t('common.actions')}</span>
                <Button fluid className={styles.actionButton} onClick={handleToggleSubscribeClick}>
                  <Icon name="paper plane outline" className={styles.actionIcon} />
                  {isSubscribed ? t('action.unsubscribe') : t('action.subscribe')}
                </Button>
                <DeletePopup
                  title={t('common.deleteCard', {
                    context: 'title',
                  })}
                  content={t('common.areYouSureYouWantToDeleteThisCard')}
                  buttonContent={t('action.deleteCard')}
                  onConfirm={onDelete}
                >
                  <Button fluid className={styles.actionButton}>
                    <Icon name="trash alternate outline" className={styles.actionIcon} />
                    {t('action.delete')}
                  </Button>
                </DeletePopup>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal>
    );
  },
);

CardModal.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  dueDate: PropTypes.instanceOf(Date),
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isSubscribed: PropTypes.bool.isRequired,
  isActionsFetching: PropTypes.bool.isRequired,
  isAllActionsFetched: PropTypes.bool.isRequired,
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  actions: PropTypes.array.isRequired,
  allProjectMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  isEditable: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onTaskCreate: PropTypes.func.isRequired,
  onTaskUpdate: PropTypes.func.isRequired,
  onTaskDelete: PropTypes.func.isRequired,
  onActionsFetch: PropTypes.func.isRequired,
  onCommentActionCreate: PropTypes.func.isRequired,
  onCommentActionUpdate: PropTypes.func.isRequired,
  onCommentActionDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CardModal.defaultProps = {
  description: undefined,
  dueDate: undefined,
  timer: undefined,
};

export default CardModal;
