const { expect } = require('chai');

const { ORPHAN_EDGES, edgeName } = require('../../utils/orphan-census');
const {
  DELETE,
  NULLIFY,
  PURGE_ACTIONS,
  actionFor,
  assertPolicyCoversEdges,
  buildBackupTableQuery,
  buildNullifyBackupTableQuery,
  buildPurgeBatchQuery,
} = require('../../utils/orphan-purge');

describe('utils/orphan-purge', () => {
  describe('PURGE_ACTIONS', () => {
    it('classifies every edge the census counts, and nothing else', () => {
      expect(() => assertPolicyCoversEdges()).to.not.throw();
    });

    it('only ever says delete or nullify', () => {
      Object.entries(PURGE_ACTIONS).forEach(([name, action]) => {
        expect(action).to.be.oneOf([DELETE, NULLIFY], `bad action for ${name}`);
      });
    });

    // The whole point of the policy. A dangling creator/assignee/cover means the
    // DECORATION is gone, not the row -- deleting a card because the user who
    // made it was removed would destroy live boards. If someone ever flips one of
    // these to `delete`, this test is the thing standing between that edit and
    // production data.
    it('never deletes a row merely because a decoration went missing', () => {
      [
        'action.user_id',
        'attachment.creator_user_id',
        'card.cover_attachment_id',
        'card.creator_user_id',
        'card.prev_list_id',
        'comment.user_id',
        'notification.creator_user_id',
        'project.background_image_id',
        'project.owner_project_manager_id',
        'task.assignee_user_id',
        'task.linked_card_id',
      ].forEach((name) => {
        expect(PURGE_ACTIONS[name]).to.equal(NULLIFY, `${name} must not be deleted`);
      });
    });

    it('deletes rows that cannot exist without their parent', () => {
      ['card.board_id', 'card.list_id', 'card_label.card_id', 'custom_field_value.card_id'].forEach(
        (name) => {
          expect(PURGE_ACTIONS[name]).to.equal(DELETE, `${name} must be deleted`);
        },
      );
    });

    it('refuses an edge it has no opinion about', () => {
      expect(() => actionFor(['card', 'unclassified_id', 'card'])).to.throw(
        /No purge action declared/,
      );
    });
  });

  describe('buildPurgeBatchQuery', () => {
    const edgeFor = (name) => ORPHAN_EDGES.find((edge) => edgeName(edge) === name);

    it('snapshots into the backup table and deletes the same ids', () => {
      const sql = buildPurgeBatchQuery(edgeFor('card_label.card_id'), { stamp: 't1', limit: 10 });

      expect(sql).to.contain('WITH doomed AS');
      expect(sql).to.contain('INSERT INTO "purge_backup_t1_card_label"');
      expect(sql).to.contain('DELETE FROM "card_label"');
      expect(sql).to.contain('LIMIT 10');
      // both halves must read the SAME cte, never re-select the predicate
      expect(sql.match(/SELECT "id" FROM doomed/g)).to.have.lengthOf(2);
    });

    it('nullifies instead of deleting on a decoration edge', () => {
      const sql = buildPurgeBatchQuery(edgeFor('card.creator_user_id'), { stamp: 't1', limit: 10 });

      expect(sql).to.contain('UPDATE "card" SET "creator_user_id" = NULL');
      expect(sql).to.not.contain('DELETE FROM');
      expect(sql).to.contain('INSERT INTO "purge_backup_t1_nullified"');
    });

    it('bounds every batch', () => {
      ORPHAN_EDGES.forEach((edge) => {
        expect(buildPurgeBatchQuery(edge, { stamp: 't1', limit: 500 })).to.contain('LIMIT 500');
      });
    });

    it('rejects an unsafe stamp rather than interpolating it', () => {
      expect(() =>
        buildPurgeBatchQuery(edgeFor('card_label.card_id'), { stamp: 'a"; DROP TABLE card; --' }),
      ).to.throw(/Unsafe SQL identifier/);
    });
  });

  describe('backup tables', () => {
    it('creates an empty structural clone, not a copy of the data', () => {
      const sql = buildBackupTableQuery('card', 't1');

      expect(sql).to.contain('CREATE TABLE IF NOT EXISTS "purge_backup_t1_card"');
      expect(sql).to.contain('WHERE false');
    });

    it('records the old value for anything it nullifies', () => {
      const sql = buildNullifyBackupTableQuery('t1');

      expect(sql).to.contain('"purge_backup_t1_nullified"');
      expect(sql).to.contain('old_value text NOT NULL');
    });
  });
});
