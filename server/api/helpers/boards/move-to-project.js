module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    targetProject: {
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
    const updatedBoard = await Board.updateOne(
      { id: inputs.board.id },
      { projectId: inputs.targetProject.id },
    );

    const updatedCards = await Card.find({ boardId: inputs.board.id });

    const migrateLabelsPromises = updatedCards.map(async (card) => {
      const cardLabels = await CardLabel.find({ cardId: card.id });
      return Promise.all(
        cardLabels.map(async (cardLabel) => {
          const oldLabel = await Label.findOne({ id: cardLabel.labelId });
          if (!oldLabel) return;

          let newLabel = await Label.findOne({
            boardId: inputs.board.id,
            name: oldLabel.name,
            color: oldLabel.color,
          });

          if (!newLabel) {
            const maxPosArr = await Label.find({ boardId: inputs.board.id })
              .sort('position DESC')
              .limit(1);
            const maxPos = maxPosArr.length > 0 ? maxPosArr[0].position : 0;

            newLabel = await Label.create({
              boardId: inputs.board.id,
              name: oldLabel.name,
              color: oldLabel.color,
              position: maxPos + 65536,
            });
          }

          await CardLabel.destroy({ cardId: card.id, labelId: cardLabel.labelId });
          await CardLabel.create({ cardId: card.id, labelId: newLabel.id });
        }),
      );
    });
    await Promise.all(migrateLabelsPromises);

    await Promise.all(
      updatedCards.map(async (card) => {
        const customFieldValues = await CustomFieldValue.find({ cardId: card.id });
        await Promise.all(
          customFieldValues.map(async (value) => {
            const group = await CustomFieldGroup.findOne({ id: value.customFieldGroupId });
            if (group && group.boardId && group.boardId !== inputs.board.id) {
              const newGroup = await CustomFieldGroup.create({
                name: group.name,
                position: group.position,
                boardId: inputs.board.id,
                baseCustomFieldGroupId: group.baseCustomFieldGroupId,
              });

              const field = await CustomField.findOne({ id: value.customFieldId });
              const newField = await CustomField.create({
                name: field.name,
                position: field.position,
                showOnFrontOfCard: field.showOnFrontOfCard,
                customFieldGroupId: newGroup.id,
                baseCustomFieldGroupId: field.baseCustomFieldGroupId,
              });

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

    const boardMemberships = await BoardMembership.find({ boardId: inputs.board.id });
    await Promise.all(
      boardMemberships.map(async (membership) => {
        const userMembership = await ProjectManager.findOne({
          projectId: inputs.targetProject.id,
          userId: membership.userId,
        });
        if (!userMembership) {
          await BoardMembership.destroy({ id: membership.id });
        }
      }),
    );

    return {
      updatedBoard,
      updatedCards,
    };
  },
};
