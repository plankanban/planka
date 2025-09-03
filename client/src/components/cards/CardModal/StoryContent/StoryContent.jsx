/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useContext, useMemo, useState } from 'react';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Gallery, Item as GalleryItem } from 'react-photoswipe-gallery';
import { Button, Grid, Icon } from 'semantic-ui-react';
import { useDidUpdate } from '../../../../lib/hooks';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { usePopupInClosableContext } from '../../../../hooks';
import { isUsableMarkdownElement } from '../../../../utils/element-helpers';
import { BoardMembershipRoles, CardTypes, ListTypes } from '../../../../constants/Enums';
import { CardTypeIcons } from '../../../../constants/Icons';
import { ClosableContext } from '../../../../contexts';
import Thumbnail from './Thumbnail';
import NameField from '../NameField';
import CustomFieldGroups from '../CustomFieldGroups';
import Communication from '../Communication';
import CreationDetailsStep from '../CreationDetailsStep';
import MoreActionsStep from '../MoreActionsStep';
import Markdown from '../../../common/Markdown';
import EditMarkdown from '../../../common/EditMarkdown';
import ConfirmationStep from '../../../common/ConfirmationStep';
import UserAvatar from '../../../users/UserAvatar';
import BoardMembershipsStep from '../../../board-memberships/BoardMembershipsStep';
import LabelChip from '../../../labels/LabelChip';
import LabelsStep from '../../../labels/LabelsStep';
import ListsStep from '../../../lists/ListsStep';
import Attachments from '../../../attachments/Attachments';
import AddAttachmentStep from '../../../attachments/AddAttachmentStep';
import AddCustomFieldGroupStep from '../../../custom-field-groups/AddCustomFieldGroupStep';

import styles from './StoryContent.module.scss';

const StoryContent = React.memo(() => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectPrevListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectAttachmentById = useMemo(() => selectors.makeSelectAttachmentById(), []);

  const card = useSelector(selectors.selectCurrentCard);
  const board = useSelector(selectors.selectCurrentBoard);
  const userIds = useSelector(selectors.selectUserIdsForCurrentCard);
  const labelIds = useSelector(selectors.selectLabelIdsForCurrentCard);
  const attachmentIds = useSelector(selectors.selectAttachmentIdsForCurrentCard);

  const imageAttachmentIdsExceptCover = useSelector(
    selectors.selectImageAttachmentIdsExceptCoverForCurrentCard,
  );

  const isJoined = useSelector(selectors.selectIsCurrentUserInCurrentCard);

  const list = useSelector((state) => selectListById(state, card.listId));

  // TODO: check availability?
  const prevList = useSelector(
    (state) => card.prevListId && selectPrevListById(state, card.prevListId),
  );

  const coverAttachment = useSelector((state) =>
    selectAttachmentById(state, card.coverAttachmentId),
  );

  const isInArchiveList = list.type === ListTypes.ARCHIVE;
  const isInTrashList = list.type === ListTypes.TRASH;

  const {
    canEditType,
    canEditName,
    canEditDescription,
    canSubscribe,
    canJoin,
    canDuplicate,
    canMove,
    canRestore,
    canArchive,
    canDelete,
    canUseLists,
    canUseMembers,
    canUseLabels,
    canAddAttachment,
    canAddCustomFieldGroup,
  } = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    let isMember = false;
    let isEditor = false;

    if (boardMembership) {
      isMember = true;
      isEditor = boardMembership.role === BoardMembershipRoles.EDITOR;
    }

    if (isInArchiveList || isInTrashList) {
      return {
        canEditType: false,
        canEditName: false,
        canEditDescription: false,
        canSubscribe: isMember,
        canJoin: false,
        canDuplicate: false,
        canMove: false,
        canRestore: isEditor,
        canArchive: isEditor,
        canDelete: isEditor,
        canUseLists: isEditor,
        canUseMembers: false,
        canUseLabels: false,
        canAddAttachment: false,
        canAddCustomFieldGroup: false,
      };
    }

    return {
      canEditType: isEditor,
      canEditName: isEditor,
      canEditDescription: isEditor,
      canSubscribe: isMember,
      canJoin: isEditor,
      canDuplicate: isEditor,
      canMove: isEditor,
      canRestore: null,
      canArchive: isEditor,
      canDelete: isEditor,
      canUseLists: isEditor,
      canUseMembers: isEditor,
      canUseLabels: isEditor,
      canAddAttachment: isEditor,
      canAddCustomFieldGroup: isEditor,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [descriptionDraft, setDescriptionDraft] = useState(null);
  const [isEditDescriptionOpened, setIsEditDescriptionOpened] = useState(false);
  const [activateClosable, deactivateClosable, setIsClosableActive] = useContext(ClosableContext);

  const handleListSelect = useCallback(
    (listId) => {
      dispatch(entryActions.moveCurrentCard(listId));
    },
    [dispatch],
  );

  const handleNameUpdate = useCallback(
    (name) => {
      dispatch(
        entryActions.updateCurrentCard({
          name,
        }),
      );
    },
    [dispatch],
  );

  const handleDescriptionUpdate = useCallback(
    (description) => {
      dispatch(
        entryActions.updateCurrentCard({
          description,
        }),
      );
    },
    [dispatch],
  );

  const handleRestoreClick = useCallback(() => {
    dispatch(entryActions.moveCurrentCard(card.prevListId, undefined, true));
  }, [card.prevListId, dispatch]);

  const handleArchiveConfirm = useCallback(() => {
    dispatch(entryActions.moveCurrentCardToArchive());
  }, [dispatch]);

  const handleDeleteConfirm = useCallback(() => {
    if (isInTrashList) {
      dispatch(entryActions.deleteCurrentCard());
    } else {
      dispatch(entryActions.moveCurrentCardToTrash());
    }
  }, [isInTrashList, dispatch]);

  const handleUserSelect = useCallback(
    (userId) => {
      dispatch(entryActions.addUserToCurrentCard(userId));
    },
    [dispatch],
  );

  const handleUserDeselect = useCallback(
    (userId) => {
      dispatch(entryActions.removeUserFromCurrentCard(userId));
    },
    [dispatch],
  );

  const handleLabelSelect = useCallback(
    (labelId) => {
      dispatch(entryActions.addLabelToCurrentCard(labelId));
    },
    [dispatch],
  );

  const handleLabelDeselect = useCallback(
    (labelId) => {
      dispatch(entryActions.removeLabelFromCurrentCard(labelId));
    },
    [dispatch],
  );

  const handleCustomFieldGroupCreate = useCallback(
    (data) => {
      dispatch(entryActions.createCustomFieldGroupInCurrentCard(data));
    },
    [dispatch],
  );

  const handleToggleJointClick = useCallback(() => {
    if (isJoined) {
      dispatch(entryActions.removeCurrentUserFromCurrentCard());
    } else {
      dispatch(entryActions.addCurrentUserToCurrentCard());
    }
  }, [isJoined, dispatch]);

  const handleToggleSubscriptionClick = useCallback(() => {
    dispatch(
      entryActions.updateCurrentCard({
        isSubscribed: !card.isSubscribed,
      }),
    );
  }, [card.isSubscribed, dispatch]);

  const handleEditDescriptionClick = useCallback((event) => {
    if (window.getSelection().toString() || isUsableMarkdownElement(event.target)) {
      return;
    }

    setIsEditDescriptionOpened(true);
  }, []);

  const handleEditDescriptionClose = useCallback((nextDescriptionDraft) => {
    setDescriptionDraft(nextDescriptionDraft);
    setIsEditDescriptionOpened(false);
  }, []);

  const handleBeforeGalleryOpen = useCallback(
    (gallery) => {
      activateClosable();

      gallery.on('destroy', () => {
        deactivateClosable();
      });
    },
    [activateClosable, deactivateClosable],
  );

  useDidUpdate(() => {
    if (!canEditDescription) {
      setIsEditDescriptionOpened(false);
    }
  }, [canEditDescription]);

  useDidUpdate(() => {
    setIsClosableActive(isEditDescriptionOpened);
  }, [isEditDescriptionOpened]);

  const CreationDetailsPopup = usePopupInClosableContext(CreationDetailsStep);
  const BoardMembershipsPopup = usePopupInClosableContext(BoardMembershipsStep);
  const LabelsPopup = usePopupInClosableContext(LabelsStep);
  const ListsPopup = usePopupInClosableContext(ListsStep);
  const AddAttachmentPopup = usePopupInClosableContext(AddAttachmentStep);
  const AddCustomFieldGroupPopup = usePopupInClosableContext(AddCustomFieldGroupStep);
  const MoreActionsPopup = usePopupInClosableContext(MoreActionsStep);
  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  return (
    <Grid className={styles.wrapper}>
      <Grid.Row className={styles.headerPadding}>
        <Grid.Column width={16} className={styles.headerPadding}>
          <div className={styles.headerWrapper}>
            <Icon
              name={CardTypeIcons[CardTypes.STORY]}
              className={classNames(styles.moduleIcon, styles.moduleIconTitle)}
            />
            <div className={styles.headerTitleWrapper}>
              {canEditName ? (
                <NameField defaultValue={card.name} size="large" onUpdate={handleNameUpdate} />
              ) : (
                <div className={styles.headerTitle}>{card.name}</div>
              )}
            </div>
          </div>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row className={styles.modalPadding}>
        <Grid.Column width={12} className={styles.contentPadding}>
          <Gallery
            withCaption
            withDownloadButton
            options={{
              wheelToZoom: true,
              showHideAnimationType: 'none',
              closeTitle: '',
              zoomTitle: '',
              arrowPrevTitle: '',
              arrowNextTitle: '',
              errorMsg: '',
              paddingFn: (viewportSize) => {
                const paddingX = viewportSize.x / 20;
                const paddingY = viewportSize.y / 20;

                return {
                  top: paddingX,
                  bottom: paddingX,
                  left: paddingY,
                  right: paddingY,
                };
              },
            }}
            onBeforeOpen={handleBeforeGalleryOpen}
          >
            {(board.alwaysDisplayCardCreator || labelIds.length > 0 || coverAttachment) && (
              <div className={classNames(styles.moduleWrapper, styles.moduleWrapperAttachments)}>
                {coverAttachment && (
                  <div className={styles.coverWrapper}>
                    <GalleryItem
                      {...coverAttachment.data.image} // eslint-disable-line react/jsx-props-no-spreading
                      original={coverAttachment.data.url}
                      caption={coverAttachment.name}
                    >
                      {({ ref, open }) => (
                        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                                    jsx-a11y/no-noninteractive-element-interactions */
                        <img
                          ref={ref}
                          src={coverAttachment.data.thumbnailUrls.outside720}
                          alt={coverAttachment.name}
                          className={styles.cover}
                          onClick={open}
                        />
                      )}
                    </GalleryItem>
                  </div>
                )}
                {board.alwaysDisplayCardCreator && (
                  <div className={styles.attachments}>
                    <span className={styles.attachment}>
                      <CreationDetailsPopup userId={card.creatorUserId}>
                        <UserAvatar withCreatorIndicator id={card.creatorUserId} size="tiny" />
                      </CreationDetailsPopup>
                    </span>
                  </div>
                )}
                {labelIds.length > 0 && (
                  <div className={styles.attachments}>
                    {labelIds.map((labelId) => (
                      <span key={labelId} className={styles.attachment}>
                        {canUseLabels ? (
                          <LabelsPopup
                            currentIds={labelIds}
                            cardId={card.id}
                            onSelect={handleLabelSelect}
                            onDeselect={handleLabelDeselect}
                          >
                            <LabelChip id={labelId} size="small" />
                          </LabelsPopup>
                        ) : (
                          <LabelChip id={labelId} size="small" />
                        )}
                      </span>
                    ))}
                    {canUseLabels && (
                      <LabelsPopup
                        currentIds={labelIds}
                        cardId={card.id}
                        onSelect={handleLabelSelect}
                        onDeselect={handleLabelDeselect}
                      >
                        <button
                          type="button"
                          className={classNames(styles.attachment, styles.dueDate)}
                        >
                          <Icon name="add" size="small" className={styles.addAttachment} />
                        </button>
                      </LabelsPopup>
                    )}
                  </div>
                )}
              </div>
            )}
            {(card.description || canEditDescription) && (
              <div className={classNames(styles.contentModule, styles.contentModuleDescription)}>
                <div className={styles.moduleWrapper}>
                  {canEditDescription &&
                    (isEditDescriptionOpened ? (
                      <EditMarkdown
                        defaultValue={card.description}
                        draftValue={descriptionDraft}
                        placeholder="common.enterDescription"
                        onUpdate={handleDescriptionUpdate}
                        onClose={handleEditDescriptionClose}
                      />
                    ) : (
                      <>
                        {descriptionDraft && (
                          <span className={styles.draftChip}>{t('common.unsavedChanges')}</span>
                        )}
                        {card.description ? (
                          /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                                      jsx-a11y/no-static-element-interactions */
                          <div
                            className={classNames(styles.descriptionText, styles.cursorPointer)}
                            onClick={handleEditDescriptionClick}
                          >
                            <Button className={styles.editButton}>
                              <Icon fitted name="pencil" size="small" />
                            </Button>
                            <Markdown>{card.description}</Markdown>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={styles.descriptionButton}
                            onClick={handleEditDescriptionClick}
                          >
                            <span className={styles.descriptionButtonText}>
                              {t('action.addMoreDetailedDescription')}
                            </span>
                          </button>
                        )}
                      </>
                    ))}
                  {!canEditDescription && (
                    <div className={styles.descriptionText}>
                      <Markdown>{card.description}</Markdown>
                    </div>
                  )}
                  {imageAttachmentIdsExceptCover.length > 0 && (
                    <div className={styles.thumbnails}>
                      {imageAttachmentIdsExceptCover.map((attachmentId) => (
                        <Thumbnail key={attachmentId} attachmentId={attachmentId} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Gallery>
          <CustomFieldGroups />
          {attachmentIds.length > 0 && (
            <div className={styles.contentModule}>
              <div className={styles.moduleWrapper}>
                <Icon name="attach" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>{t('common.attachments')}</div>
                <Attachments hideImagesWhenNotAllVisible />
              </div>
            </div>
          )}
          <div className={styles.contentModule}>
            <div className={styles.moduleWrapper}>
              <Icon name="list ul" className={styles.moduleIcon} />
              <Communication />
            </div>
          </div>
        </Grid.Column>
        <Grid.Column width={4} className={styles.sidebarPadding}>
          <div className={styles.sticky}>
            <div className={styles.actions}>
              <div className={classNames(styles.attachments, styles.attachmentsList)}>
                <div className={classNames(styles.text, styles.textList)}>{t('common.list')}</div>
                {canUseLists ? (
                  <ListsPopup currentId={list.id} onSelect={handleListSelect}>
                    <button type="button" className={styles.listButton}>
                      <span className={classNames(styles.list, styles.listHoverable)}>
                        <Icon name="columns" size="small" className={styles.listIcon} />
                        <span className={styles.hidable}>
                          {list.name || t(`common.${list.type}`)}
                        </span>
                      </span>
                    </button>
                  </ListsPopup>
                ) : (
                  <span className={styles.list}>
                    <Icon name="columns" size="small" className={styles.listIcon} />
                    <span className={styles.hidable}>{list.name || t(`common.${list.type}`)}</span>
                  </span>
                )}
              </div>
            </div>
            {(canUseMembers || canUseLabels || canAddAttachment || canAddCustomFieldGroup) && (
              <div className={styles.actions}>
                <span className={styles.actionsTitle}>{t('action.addToCard')}</span>
                {canUseLabels && (
                  <LabelsPopup
                    currentIds={labelIds}
                    cardId={card.id}
                    onSelect={handleLabelSelect}
                    onDeselect={handleLabelDeselect}
                  >
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="bookmark outline" className={styles.actionIcon} />
                      {t('common.labels')}
                    </Button>
                  </LabelsPopup>
                )}
                {canAddAttachment && (
                  <AddAttachmentPopup>
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="attach" className={styles.actionIcon} />
                      {t('common.attachment')}
                    </Button>
                  </AddAttachmentPopup>
                )}
                {canAddCustomFieldGroup && (
                  <AddCustomFieldGroupPopup onCreate={handleCustomFieldGroupCreate}>
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="sticky note outline" className={styles.actionIcon} />
                      {t('common.customField', {
                        context: 'title',
                      })}
                    </Button>
                  </AddCustomFieldGroupPopup>
                )}
                {canUseMembers && (
                  <BoardMembershipsPopup
                    currentUserIds={userIds}
                    onUserSelect={handleUserSelect}
                    onUserDeselect={handleUserDeselect}
                  >
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="user outline" className={styles.actionIcon} />
                      {t('common.members')}
                    </Button>
                  </BoardMembershipsPopup>
                )}
              </div>
            )}
            {((!board.limitCardTypesToDefaultOne && canEditType) ||
              canSubscribe ||
              canJoin ||
              canDuplicate ||
              canMove ||
              (canRestore && (isInArchiveList || isInTrashList)) ||
              (canArchive && !isInArchiveList) ||
              canDelete) && (
              <div className={styles.actions}>
                <span className={styles.actionsTitle}>{t('common.actions')}</span>
                {canJoin && (
                  <Button
                    fluid
                    className={classNames(styles.actionButton, styles.hidable)}
                    onClick={handleToggleJointClick}
                  >
                    <Icon
                      name={isJoined ? 'flag outline' : 'flag checkered'}
                      className={styles.actionIcon}
                    />
                    {isJoined ? t('action.leave') : t('action.join')}
                  </Button>
                )}
                {canSubscribe && (
                  <Button
                    fluid
                    disabled={board.isSubscribed}
                    className={classNames(styles.actionButton, styles.hidable)}
                    onClick={handleToggleSubscriptionClick}
                  >
                    {board.isSubscribed ? (
                      <>
                        <Icon name="bell slash outline" className={styles.actionIcon} />
                        {t('common.boardSubscribed')}
                      </>
                    ) : (
                      <>
                        <Icon
                          name={card.isSubscribed ? 'bell slash outline' : 'bell outline'}
                          className={styles.actionIcon}
                        />
                        {card.isSubscribed ? t('action.unsubscribe') : t('action.subscribe')}
                      </>
                    )}
                  </Button>
                )}
                {canRestore && (isInArchiveList || isInTrashList) && (
                  <Button
                    fluid
                    disabled={!prevList}
                    className={classNames(styles.actionButton, styles.hidable)}
                    onClick={handleRestoreClick}
                  >
                    <Icon name="undo alternate" className={styles.actionIcon} />
                    {prevList
                      ? t('action.restoreToList', {
                          list: prevList.name || t(`common.${prevList.type}`),
                        })
                      : t('common.selectListToRestoreThisCard')}
                  </Button>
                )}
                {canArchive && !isInArchiveList && (
                  <ConfirmationPopup
                    title="common.archiveCard"
                    content="common.areYouSureYouWantToArchiveThisCard"
                    buttonContent="action.archiveCard"
                    onConfirm={handleArchiveConfirm}
                  >
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="folder open outline" className={styles.actionIcon} />
                      {t('action.archive')}
                    </Button>
                  </ConfirmationPopup>
                )}
                {canDelete && (
                  <ConfirmationPopup
                    title={isInTrashList ? 'common.deleteCardForever' : 'common.deleteCard'}
                    content={
                      isInTrashList
                        ? 'common.areYouSureYouWantToDeleteThisCardForever'
                        : 'common.areYouSureYouWantToDeleteThisCard'
                    }
                    buttonContent={isInTrashList ? 'action.deleteCardForever' : 'action.deleteCard'}
                    onConfirm={handleDeleteConfirm}
                  >
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="trash alternate outline" className={styles.actionIcon} />
                      {isInTrashList
                        ? t('action.deleteForever', {
                            context: 'title',
                          })
                        : t('action.delete')}
                    </Button>
                  </ConfirmationPopup>
                )}
                {((!board.limitCardTypesToDefaultOne && canEditType) ||
                  canDuplicate ||
                  canMove) && (
                  <MoreActionsPopup>
                    <Button fluid className={classNames(styles.moreActionsButton, styles.hidable)}>
                      <Icon name="ellipsis horizontal" className={styles.moreActionsButtonIcon} />
                      {t('common.moreActions')}
                    </Button>
                  </MoreActionsPopup>
                )}
              </div>
            )}
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
});

export default StoryContent;
