/*
 * Public board viewer
 * Returns a sanitized, read-only snapshot of a board identified by `publicId`.
 * Strips user-identifying information (creator names, comment authors) but preserves
 * content (descriptions, comments, custom fields) to make the board useful for sharing.
 */

module.exports = {
  inputs: {
    publicId: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const board = await Board.qm.getOneByPublicId(inputs.publicId);

    if (!board || !board.isPublic) {
      throw 'notFound';
    }

    const project = await Project.qm.getOneById(board.projectId);
    if (!project) {
      throw 'notFound';
    }

    const labels = await Label.qm.getByBoardId(board.id);
    const lists = await List.qm.getByBoardId(board.id);

    const finiteLists = lists.filter((list) => sails.helpers.lists.isFinite(list));
    const finiteListIds = sails.helpers.utils.mapRecords(finiteLists);

    const cards = await Card.qm.getByListIds(finiteListIds);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    // Sanitize cards: strip user-identifying fields but keep content
    const sanitizedCards = cards.map((card) => ({
      id: card.id,
      boardId: card.boardId,
      listId: card.listId,
      creatorUserId: null, // Strip creator
      prevListId: card.prevListId,
      coverAttachmentId: card.coverAttachmentId,
      type: card.type,
      position: card.position,
      name: card.name,
      description: card.description, // Keep descriptions
      dueDate: card.dueDate,
      isDueCompleted: card.isDueCompleted,
      stopwatch: card.stopwatch,
      commentsTotal: card.commentsTotal,
      isClosed: card.isClosed,
      listChangedAt: card.listChangedAt,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));

    const cardLabels = await CardLabel.qm.getByCardIds(cardIds);
    const taskLists = await TaskList.qm.getByCardIds(cardIds);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);
    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const attachments = await Attachment.qm.getByCardIds(cardIds);

    const boardCustomFieldGroups = await CustomFieldGroup.qm.getByBoardId(board.id);
    const cardCustomFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);
    const customFieldGroups = [...boardCustomFieldGroups, ...cardCustomFieldGroups];
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);
    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds);

    // Fetch comments but anonymize authors
    const comments = await Comment.qm.getByCardIds(cardIds);
    const sanitizedComments = comments.map((comment) => ({
      id: comment.id,
      cardId: comment.cardId,
      userId: null, // Strip comment author
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    return {
      item: board,
      included: {
        labels,
        lists,
        cards: sanitizedCards,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups,
        customFields,
        customFieldValues,
        comments: sanitizedComments,
        attachments: sails.helpers.attachments.presentMany(attachments),
        projects: [project],
      },
    };
  },
};
