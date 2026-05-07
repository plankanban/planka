/*!
 * auto-archive hook
 *
 * Periodically scans for cards that have been sitting in a "closed" (Concluído)
 * list for longer than the configured threshold, and moves them to the board's
 * archive list.
 *
 * Configuration (via env):
 *   AUTO_ARCHIVE_CLOSED_AFTER_DAYS  number of days a card may stay in a
 *                                   closed list before being archived.
 *                                   Default: 30. Set to 0 to disable entirely.
 *   AUTO_ARCHIVE_CHECK_INTERVAL_MIN minutes between runs. Default: 60.
 */

const DEFAULT_AFTER_DAYS = 30;
const DEFAULT_CHECK_INTERVAL_MIN = 60;
const FIRST_RUN_DELAY_MS = 5 * 60 * 1000; // wait 5 min after lift before first scan

module.exports = function defineAutoArchiveHook(sails) {
  const rawAfter = process.env.AUTO_ARCHIVE_CLOSED_AFTER_DAYS;
  const afterDays = rawAfter !== undefined ? parseInt(rawAfter, 10) : DEFAULT_AFTER_DAYS;

  const rawInterval = process.env.AUTO_ARCHIVE_CHECK_INTERVAL_MIN;
  const checkIntervalMin = Math.max(
    1,
    rawInterval !== undefined ? parseInt(rawInterval, 10) : DEFAULT_CHECK_INTERVAL_MIN,
  );

  const archiveExpiredClosedCards = async () => {
    if (!Number.isFinite(afterDays) || afterDays <= 0) return;

    try {
      const cutoff = new Date(Date.now() - afterDays * 24 * 60 * 60 * 1000).toISOString();

      // Find all closed lists in the system once.
      const closedLists = await List.find({ type: List.Types.CLOSED });
      if (closedLists.length === 0) return;
      const closedListIds = closedLists.map((l) => l.id);

      // Cards stuck in any closed list past the cutoff.
      const cards = await Card.find({
        listId: closedListIds,
        listChangedAt: { '<': cutoff },
      });
      if (cards.length === 0) return;

      // Index archive lists by boardId so we don't query repeatedly.
      const uniqueBoardIds = [...new Set(cards.map((c) => c.boardId))];
      const archiveByBoard = new Map();
      await Promise.all(
        uniqueBoardIds.map(async (boardId) => {
          const archive = await List.qm.getOneArchiveByBoardId(boardId);
          archiveByBoard.set(boardId, archive || null);
        }),
      );

      const closedById = new Map(closedLists.map((l) => [l.id, l]));

      const moveResults = await Promise.all(
        cards.map(async (card) => {
          const archive = archiveByBoard.get(card.boardId);
          if (!archive) return null;

          const fromList = closedById.get(card.listId);

          await Card.updateOne(card.id).set({
            listId: archive.id,
            prevListId: card.listId,
            position: null,
            listChangedAt: new Date().toISOString(),
          });

          sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
            item: {
              id: card.id,
              listId: archive.id,
              prevListId: card.listId,
              position: null,
            },
          });

          if (fromList) {
            await sails.helpers.actions.createOne
              .with({
                webhooks: [],
                values: {
                  card,
                  type: 'moveCard',
                  data: {
                    card: { name: card.name },
                    fromList: { id: fromList.id, type: fromList.type, name: fromList.name },
                    toList: { id: archive.id, type: archive.type, name: archive.name },
                    auto: true,
                    reason: 'auto-archive-closed',
                    afterDays,
                  },
                  user: null,
                },
                project: null,
                board: { id: card.boardId },
                list: archive,
              })
              .tolerate(() => undefined);
          }

          return card.id;
        }),
      );

      const movedCount = moveResults.filter(Boolean).length;

      if (movedCount > 0) {
        sails.log.info(
          `[auto-archive] moved ${movedCount} card(s) from closed → archive (>${afterDays} days)`,
        );
      }
    } catch (error) {
      sails.log.error(`[auto-archive] sweep failed: ${error.message}`);
    }
  };

  return {
    async initialize() {
      if (!Number.isFinite(afterDays) || afterDays <= 0) {
        sails.log.info('[auto-archive] disabled (AUTO_ARCHIVE_CLOSED_AFTER_DAYS=0)');
        return;
      }

      sails.log.info(
        `[auto-archive] enabled — closing cards older than ${afterDays} day(s) every ${checkIntervalMin} min`,
      );

      setTimeout(archiveExpiredClosedCards, FIRST_RUN_DELAY_MS);
      setInterval(archiveExpiredClosedCards, checkIntervalMin * 60 * 1000);
    },
  };
};
