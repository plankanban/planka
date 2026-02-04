/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {},

  async fn() {
    const { currentUser } = this.req;

    // Get all cards where the user is a member
    const cardMemberships = await CardMembership.find({ userId: currentUser.id });
    const cardIdsByMembership = cardMemberships.map((cm) => cm.cardId);

    // Get all cards where the user is the author
    const cardsByAuthor = await Card.find({ creatorUserId: currentUser.id });
    const cardIdsByAuthor = cardsByAuthor.map((c) => c.id);

    // Merge card ids
    const cardIds = Array.from(new Set([...cardIdsByMembership, ...cardIdsByAuthor]));
    if (cardIds.length === 0) {
      return { items: [], included: {} };
    }

    // Get cards
    const cards = await Card.qm.getByIds(cardIds);

    // Collect related data
    const users = await User.qm.getByIds(cards.map((c) => c.creatorUserId));
    const cardMembershipsAll = await CardMembership.qm.getByCardIds(cardIds);
    const cardLabels = await CardLabel.qm.getByCardIds(cardIds);
    const taskLists = await TaskList.qm.getByCardIds(cardIds);
    const taskListIds = taskLists.map((tl) => tl.id);
    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const attachments = await Attachment.qm.getByCardIds(cardIds);
    const customFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);
    const customFieldGroupIds = customFieldGroups.map((cfg) => cfg.id);
    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds);

    return {
      items: cards,
      included: {
        cardMemberships: cardMembershipsAll,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups,
        customFields,
        customFieldValues,
        users: sails.helpers.users.presentMany(users, currentUser),
        attachments: sails.helpers.attachments.presentMany(attachments),
      },
    };
  },
};
