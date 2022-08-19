module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const role = inputs.values.role || inputs.record.role;

    if (role === BoardMembership.Roles.EDITOR) {
      inputs.values.canComment = null; // eslint-disable-line no-param-reassign
    } else if (role === BoardMembership.Roles.VIEWER) {
      const canComment = _.isUndefined(inputs.values.canComment)
        ? inputs.record.canComment
        : inputs.values.canComment;

      if (_.isNull(canComment)) {
        inputs.values.canComment = false; // eslint-disable-line no-param-reassign
      }
    }

    const boardMembership = await BoardMembership.updateOne(inputs.record.id).set(inputs.values);

    if (boardMembership) {
      sails.sockets.broadcast(
        `board:${boardMembership.boardId}`,
        'boardMembershipUpdate',
        {
          item: boardMembership,
        },
        inputs.request,
      );
    }

    return boardMembership;
  },
};
