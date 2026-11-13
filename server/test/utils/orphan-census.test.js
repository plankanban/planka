const { expect } = require('chai');

const {
  ORPHAN_EDGES,
  edgeName,
  buildCountQuery,
  buildSelectQuery,
  buildCensusQuery,
  summarize,
} = require('../../utils/orphan-census');

describe('utils/orphan-census', () => {
  describe('ORPHAN_EDGES', () => {
    it('describes every edge as [table, column, parentTable]', () => {
      ORPHAN_EDGES.forEach((edge) => {
        expect(edge).to.have.lengthOf(3, `malformed edge: ${JSON.stringify(edge)}`);

        edge.forEach((identifier) => {
          expect(identifier).to.match(
            /^[a-z][a-z0-9_]*$/,
            `unsafe identifier in ${JSON.stringify(edge)}`,
          );
        });
      });
    });

    it('has no duplicate edges', () => {
      const names = ORPHAN_EDGES.map(edgeName);

      expect(names).to.have.lengthOf(new Set(names).size);
    });

    it('covers the edges the 2026-08-09 live census found orphans on', () => {
      // Every edge below had a non-zero count in production. If one of these
      // ever disappears from the census the monitor silently stops watching
      // the thing it exists to watch.
      const mustCover = [
        'custom_field_group.board_id',
        'notification.card_id',
        'notification.board_id',
        'notification.comment_id',
        'notification.action_id',
        'task_list.card_id',
        'action.card_id',
        'card_subscription.card_id',
        'board_membership.board_id',
        'comment.card_id',
        'project_manager.project_id',
      ];

      const names = new Set(ORPHAN_EDGES.map(edgeName));

      mustCover.forEach((name) => {
        expect(names.has(name)).to.equal(true, `census no longer checks ${name}`);
      });
    });
  });

  describe('#buildCountQuery()', () => {
    it('counts children whose non-null foreign key has no parent', () => {
      const query = buildCountQuery(['task_list', 'card_id', 'card']);

      expect(query).to.equal(
        'SELECT COUNT(*)::int AS total FROM "task_list" c ' +
          'LEFT JOIN "card" p ON c."card_id" = p."id" ' +
          'WHERE c."card_id" IS NOT NULL AND p."id" IS NULL',
      );
    });

    it('refuses an identifier that is not a plain snake_case name', () => {
      expect(() => buildCountQuery(['task_list; DROP TABLE card', 'card_id', 'card'])).to.throw(
        /Unsafe SQL identifier/,
      );
      expect(() => buildCountQuery(['task_list', 'card_id"', 'card'])).to.throw(
        /Unsafe SQL identifier/,
      );
    });
  });

  describe('#buildSelectQuery()', () => {
    it('selects offending ids with a bounded limit', () => {
      const query = buildSelectQuery(['project_manager', 'project_id', 'project'], { limit: 5 });

      expect(query).to.contain('SELECT c."id", c."project_id" FROM "project_manager" c');
      expect(query).to.contain('LIMIT 5');
    });

    it('coerces the limit to a number', () => {
      const query = buildSelectQuery(['project_manager', 'project_id', 'project'], {
        limit: '1; DROP TABLE card',
      });

      expect(query).to.contain('LIMIT NaN');
      expect(query).to.not.contain('DROP TABLE');
    });
  });

  describe('#buildCensusQuery()', () => {
    it('unions one labelled count per edge', () => {
      const query = buildCensusQuery([
        ['task_list', 'card_id', 'card'],
        ['list', 'board_id', 'board'],
      ]);

      expect(query.split(' UNION ALL ')).to.have.lengthOf(2);
      expect(query).to.contain("'task_list.card_id' AS edge");
      expect(query).to.contain("'list.board_id' AS edge");
    });

    it('covers every edge by default', () => {
      expect(buildCensusQuery().split(' UNION ALL ')).to.have.lengthOf(ORPHAN_EDGES.length);
    });
  });

  describe('#summarize()', () => {
    it('keeps clean edges but reports only the dirty ones, worst first', () => {
      const summary = summarize([
        { edge: 'list.board_id', total: 0 },
        { edge: 'task_list.card_id', total: 8 },
        { edge: 'custom_field_group.board_id', total: 1118 },
      ]);

      expect(summary.total).to.equal(1126);
      expect(summary.totalsByEdge['list.board_id']).to.equal(0);
      expect(summary.orphanedEdges).to.eql([
        ['custom_field_group.board_id', 1118],
        ['task_list.card_id', 8],
      ]);
    });

    it('reports a clean database as zero', () => {
      const summary = summarize([{ edge: 'list.board_id', total: 0 }]);

      expect(summary.total).to.equal(0);
      expect(summary.orphanedEdges).to.eql([]);
    });
  });
});
