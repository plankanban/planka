/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  GOOGLE_MAPS_NOT_CONFIGURED: {
    googleMapsNotConfigured: 'Google Maps API key is not configured',
  },
  GOOGLE_MAPS_UNAVAILABLE: {
    googleMapsUnavailable: 'Google Maps API is unreachable',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    query: {
      type: 'string',
      required: true,
      maxLength: 256,
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    googleMapsNotConfigured: {
      responseType: 'notFound',
    },
    googleMapsUnavailable: {
      responseType: 'badGateway',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const googleMapsApiKey = sails.config.custom.googleMapsApiKey || '';

    if (!googleMapsApiKey) {
      throw Errors.GOOGLE_MAPS_NOT_CONFIGURED;
    }

    const { card, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          card.boardId,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.CARD_NOT_FOUND; // Forbidden
        }
      }
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(inputs.query)}&key=${encodeURIComponent(googleMapsApiKey)}`;

    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      throw Errors.GOOGLE_MAPS_UNAVAILABLE;
    }

    if (!response.ok) {
      throw Errors.GOOGLE_MAPS_UNAVAILABLE;
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw Errors.GOOGLE_MAPS_UNAVAILABLE;
    }

    const results = (data.results || []).slice(0, 5);

    const items = results.map((result) => ({
      placeName: result.name || '',
      latitude: result.geometry && result.geometry.location ? result.geometry.location.lat : 0,
      longitude: result.geometry && result.geometry.location ? result.geometry.location.lng : 0,
      formattedAddress: result.formatted_address || '',
    }));

    return {
      items,
    };
  },
};
