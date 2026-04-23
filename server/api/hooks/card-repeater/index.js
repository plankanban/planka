/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * card-repeater hook
 *
 * @description :: Creates recurring card copies when their next repeat is due.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

const INTERVAL = 60 * 1000;
const LIMIT = 50;

module.exports = function defineCardRepeaterHook(sails) {
  let interval;
  let isRunning = false;

  const processDueCards = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      const cards = await Card.qm.getDueToRepeat(new Date().toISOString(), {
        limit: LIMIT,
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const card of cards) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await sails.helpers.cards.repeatOne(card);
        } catch (error) {
          sails.log.error(`Failed to repeat card ${card.id}`, error);
        }
      }
    } finally {
      isRunning = false;
    }
  };

  return {
    initialize() {
      sails.log.info('Initializing custom hook (`card-repeater`)');

      sails.after('lifted', () => {
        interval = setInterval(() => {
          processDueCards().catch((error) => {
            sails.log.error('Failed to process recurring cards', error);
          });
        }, INTERVAL);

        processDueCards().catch((error) => {
          sails.log.error('Failed to process recurring cards', error);
        });
      });
    },

    teardown(done) {
      if (interval) {
        clearInterval(interval);
      }

      done();
    },
  };
};
