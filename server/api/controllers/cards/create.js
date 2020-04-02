const moment = require('moment');

const Errors = {
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    dueDate: {
      type: 'string',
      custom: (value) => moment(value, moment.ISO_8601, true).isValid(),
    },
    timer: {
      type: 'json',
      custom: (value) =>
        _.isPlainObject(value) &&
        _.size(value) === 2 &&
        (_.isNull(value.startedAt) || moment(value.startedAt, moment.ISO_8601, true).isValid()) &&
        _.isFinite(value.total),
    },
  },

  exits: {
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { list, project } = await sails.helpers
      .getListToProjectPath(inputs.listId)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name', 'description', 'dueDate', 'timer']);

    const card = await sails.helpers.createCard(list, values, currentUser, this.req);

    return exits.success({
      item: card,
    });
  },
};
