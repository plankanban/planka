/* eslint-disable global-require */

const { expect } = require('chai');

describe('Board/List descriptions', () => {
  it('should expose nullable description attributes on Board and List models', () => {
    const boardModel = require('../../../api/models/Board');
    const listModel = require('../../../api/models/List');

    expect(boardModel.attributes.description).to.include({
      type: 'string',
      allowNull: true,
    });

    expect(listModel.attributes.description).to.include({
      type: 'string',
      allowNull: true,
    });
  });

  it('should accept description in board create/update controller inputs', () => {
    const createController = require('../../../api/controllers/boards/create');
    const updateController = require('../../../api/controllers/boards/update');

    expect(createController.inputs.description).to.include({
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    });

    expect(updateController.inputs.description).to.include({
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    });
  });

  it('should accept description in list create/update controller inputs', () => {
    const createController = require('../../../api/controllers/lists/create');
    const updateController = require('../../../api/controllers/lists/update');

    expect(createController.inputs.description).to.include({
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    });

    expect(updateController.inputs.description).to.include({
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    });
  });
});
