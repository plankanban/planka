module.exports = {
  inputs: {
    list: {
      type: 'ref',
      required: true,
    },
    targetBoard: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const updatedList = await List.updateOne(
      { id: inputs.list.id },
      { boardId: inputs.targetBoard.id },
    );

    const updatedCards = await Card.update(
      { listId: inputs.list.id },
      { boardId: inputs.targetBoard.id },
    ).fetch();

    const migrateLabelsPromises = updatedCards.map(async (card) => {
      const cardLabels = await CardLabel.find({ cardId: card.id });
      return Promise.all(
        cardLabels.map(async (cardLabel) => {
          const oldLabel = await Label.findOne({ id: cardLabel.labelId });
          if (!oldLabel) return;
          let newLabel = await Label.findOne({
            boardId: inputs.targetBoard.id,
            name: oldLabel.name,
            color: oldLabel.color,
          });
          if (!newLabel) {
            const maxPosArr = await Label.find({ boardId: inputs.targetBoard.id })
              .sort('position DESC')
              .limit(1);
            const maxPos = maxPosArr.length > 0 ? maxPosArr[0].position : 0;
            newLabel = await Label.create({
              boardId: inputs.targetBoard.id,
              name: oldLabel.name,
              color: oldLabel.color,
              position: maxPos + 65536,
            }).fetch();
          }
          await CardLabel.destroy({ cardId: card.id, labelId: cardLabel.labelId });
          await CardLabel.create({ cardId: card.id, labelId: newLabel.id });
        }),
      );
    });
    await Promise.all(migrateLabelsPromises);

    await Promise.all(
      updatedCards.map(async (card) => {
        const cardMemberships = await CardMembership.find({ cardId: card.id });
        await Promise.all(
          cardMemberships.map(async (membership) => {
            const userMembership = await BoardMembership.findOne({
              boardId: inputs.targetBoard.id,
              userId: membership.userId,
            });
            if (!userMembership) {
              await CardMembership.destroy({ id: membership.id });
            }
          }),
        );
      }),
    );

    await Promise.all(
      updatedCards.map(async (card) => {
        const customFieldValues = await CustomFieldValue.find({ cardId: card.id });
        await Promise.all(
          customFieldValues.map(async (value) => {
            const group = await CustomFieldGroup.findOne({ id: value.customFieldGroupId });
            if (group && group.boardId && group.boardId !== inputs.targetBoard.id) {
              const newGroup = await CustomFieldGroup.create({
                name: group.name,
                position: group.position,
                cardId: card.id,
                baseCustomFieldGroupId: group.baseCustomFieldGroupId,
              }).fetch();
              const field = await CustomField.findOne({ id: value.customFieldId });
              const newField = await CustomField.create({
                name: field.name,
                position: field.position,
                showOnFrontOfCard: field.showOnFrontOfCard,
                customFieldGroupId: newGroup.id,
                baseCustomFieldGroupId: field.baseCustomFieldGroupId,
              }).fetch();
              await CustomFieldValue.updateOne(
                { id: value.id },
                {
                  customFieldGroupId: newGroup.id,
                  customFieldId: newField.id,
                },
              );
            }
          }),
        );
      }),
    );

    return {
      updatedList,
      updatedCards,
    };
  },
};
