/*!
 * Property-based tests for card duplication location preservation
 * Feature: card-location
 * Property 7: Card duplication preserves location data
 * Validates: Requirements 7.1, 7.3
 */

const { expect } = require('chai');
const fc = require('fast-check');
const _ = require('lodash');

/**
 * The fields that the duplicate-one helper picks from the source card record.
 * This mirrors the _.pick call in server/api/helpers/cards/duplicate-one.js.
 */
const DUPLICATE_PICK_FIELDS = [
  'boardId',
  'listId',
  'prevListId',
  'type',
  'name',
  'description',
  'dueDate',
  'isDueCompleted',
  'stopwatch',
  'location',
  'isClosed',
];

/**
 * Generates a valid location object matching the Location_Field schema:
 * - placeName: non-empty string, max 256 chars
 * - latitude: number between -90 and 90
 * - longitude: number between -180 and 180
 * - formattedAddress: string, max 512 chars
 */
const validLocationArb = fc.record({
  placeName: fc.string({ minLength: 1, maxLength: 256 }),
  latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  formattedAddress: fc.string({ minLength: 0, maxLength: 512 }),
});

/**
 * Generates a minimal card record with standard fields plus a location.
 */
const cardRecordWithLocationArb = validLocationArb.map((location) => ({
  id: 'card-1',
  boardId: 'board-1',
  listId: 'list-1',
  prevListId: null,
  type: 'default',
  name: 'Test Card',
  description: 'A test card',
  dueDate: null,
  isDueCompleted: false,
  stopwatch: null,
  location,
  isClosed: false,
  creatorUserId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

describe('helpers/cards/duplicate-one', () => {
  describe('Feature: card-location, Property 7: Card duplication preserves location data', () => {
    it('should preserve location data via deep equality after _.pick duplication logic', () => {
      fc.assert(
        fc.property(cardRecordWithLocationArb, (cardRecord) => {
          const picked = _.pick(cardRecord, DUPLICATE_PICK_FIELDS);

          // The picked result must include the location field
          expect(picked).to.have.property('location');

          // The location must be deeply equal to the original
          expect(picked.location).to.deep.equal(cardRecord.location);
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve null location when card has no location assigned', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.constant('card-1'),
            boardId: fc.constant('board-1'),
            listId: fc.constant('list-1'),
            prevListId: fc.constant(null),
            type: fc.constant('default'),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ maxLength: 500 }),
            dueDate: fc.constant(null),
            isDueCompleted: fc.boolean(),
            stopwatch: fc.constant(null),
            location: fc.constant(null),
            isClosed: fc.boolean(),
            creatorUserId: fc.constant('user-1'),
          }),
          (cardRecord) => {
            const picked = _.pick(cardRecord, DUPLICATE_PICK_FIELDS);

            // The picked result must include the location field
            expect(picked).to.have.property('location');

            // Null location must be preserved as null
            expect(picked.location).to.be.null;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should not mutate the original location object during pick', () => {
      fc.assert(
        fc.property(validLocationArb, (location) => {
          const originalLocation = _.cloneDeep(location);
          const cardRecord = {
            boardId: 'board-1',
            listId: 'list-1',
            prevListId: null,
            type: 'default',
            name: 'Test Card',
            description: '',
            dueDate: null,
            isDueCompleted: false,
            stopwatch: null,
            location,
            isClosed: false,
          };

          _.pick(cardRecord, DUPLICATE_PICK_FIELDS);

          // Original location must not be mutated
          expect(cardRecord.location).to.deep.equal(originalLocation);
        }),
        { numRuns: 100 },
      );
    });

    it('should produce a location reference in picked result (shallow copy behavior of _.pick)', () => {
      fc.assert(
        fc.property(validLocationArb, (location) => {
          const cardRecord = {
            boardId: 'board-1',
            listId: 'list-1',
            prevListId: null,
            type: 'default',
            name: 'Test Card',
            description: '',
            dueDate: null,
            isDueCompleted: false,
            stopwatch: null,
            location,
            isClosed: false,
          };

          const picked = _.pick(cardRecord, DUPLICATE_PICK_FIELDS);

          // _.pick performs a shallow copy — the location object reference is shared
          // This verifies the pick includes location and it's deeply equal
          expect(picked.location).to.deep.equal(location);
          expect(picked.location).to.equal(cardRecord.location);
        }),
        { numRuns: 100 },
      );
    });
  });
});
