/*!
 * Property-based tests for location validator
 * Feature: card-location
 * Property 1: Location validation accepts valid objects and rejects invalid ones
 * Validates: Requirements 1.1, 1.3, 1.4, 1.5
 */

const { expect } = require('chai');
const fc = require('fast-check');

// lodash is used as a global `_` in Sails.js — set it up before requiring validators
global._ = require('lodash');

const { isLocation } = require('../../utils/validators');

/**
 * Generates a valid location object with all fields meeting spec constraints.
 */
const validLocationArb = fc.record({
  placeName: fc.string({ minLength: 1, maxLength: 256 }),
  latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  formattedAddress: fc.string({ minLength: 0, maxLength: 512 }),
});

/**
 * Generates a valid location object at boundary values.
 */
const boundaryLocationArb = fc.record({
  placeName: fc.oneof(
    fc.string({ minLength: 1, maxLength: 1 }),
    fc.string({ minLength: 256, maxLength: 256 }),
  ),
  latitude: fc.oneof(
    fc.constant(-90),
    fc.constant(90),
    fc.constant(0),
    fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  ),
  longitude: fc.oneof(
    fc.constant(-180),
    fc.constant(180),
    fc.constant(0),
    fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  ),
  formattedAddress: fc.oneof(
    fc.constant(''),
    fc.string({ minLength: 512, maxLength: 512 }),
  ),
});

describe('validators', () => {
  describe('#isLocation(value)', () => {
    describe('Feature: card-location, Property 1: Location validation accepts valid objects and rejects invalid ones', () => {
      it('should accept null', () => {
        expect(isLocation(null)).to.be.true;
      });

      it('should accept all valid location objects', () => {
        fc.assert(
          fc.property(validLocationArb, (location) => {
            expect(isLocation(location)).to.be.true;
          }),
          { numRuns: 100 },
        );
      });

      it('should accept valid location objects at boundary values', () => {
        fc.assert(
          fc.property(boundaryLocationArb, (location) => {
            expect(isLocation(location)).to.be.true;
          }),
          { numRuns: 100 },
        );
      });

      it('should reject non-object values (arbitrary JSON primitives)', () => {
        const nonObjectArb = fc.oneof(
          fc.integer(),
          fc.double({ noNaN: true }),
          fc.string(),
          fc.boolean(),
          fc.constant(undefined),
          fc.array(fc.anything()),
        );

        fc.assert(
          fc.property(nonObjectArb, (value) => {
            expect(isLocation(value)).to.be.false;
          }),
          { numRuns: 100 },
        );
      });

      it('should reject objects with missing fields', () => {
        const requiredKeys = ['placeName', 'latitude', 'longitude', 'formattedAddress'];

        // Generate a valid location then remove one or more fields
        const missingFieldArb = fc
          .tuple(
            validLocationArb,
            fc.subarray(requiredKeys, { minLength: 1, maxLength: 3 }),
          )
          .map(([location, keysToRemove]) => {
            const incomplete = { ...location };
            keysToRemove.forEach((key) => delete incomplete[key]);
            return incomplete;
          });

        fc.assert(
          fc.property(missingFieldArb, (value) => {
            expect(isLocation(value)).to.be.false;
          }),
          { numRuns: 100 },
        );
      });

      it('should reject objects with extra fields', () => {
        const extraFieldArb = fc
          .tuple(validLocationArb, fc.string({ minLength: 1, maxLength: 20 }), fc.anything())
          .filter(([, key]) => !['placeName', 'latitude', 'longitude', 'formattedAddress'].includes(key))
          .map(([location, key, val]) => ({ ...location, [key]: val }));

        fc.assert(
          fc.property(extraFieldArb, (value) => {
            expect(isLocation(value)).to.be.false;
          }),
          { numRuns: 100 },
        );
      });

      it('should reject objects with out-of-range latitude', () => {
        const invalidLatArb = fc.oneof(
          fc.double({ min: 90.0001, max: 1000, noNaN: true, noDefaultInfinity: true }),
          fc.double({ min: -1000, max: -90.0001, noNaN: true, noDefaultInfinity: true }),
          fc.constant(Infinity),
          fc.constant(-Infinity),
          fc.constant(NaN),
        );

        const invalidLatLocationArb = fc
          .tuple(validLocationArb, invalidLatArb)
          .map(([location, lat]) => ({ ...location, latitude: lat }));

        fc.assert(
          fc.property(invalidLatLocationArb, (value) => {
            expect(isLocation(value)).to.be.false;
          }),
          { numRuns: 100 },
        );
      });

      it('should reject objects with out-of-range longitude', () => {
        const invalidLngArb = fc.oneof(
          fc.double({ min: 180.0001, max: 1000, noNaN: true, noDefaultInfinity: true }),
          fc.double({ min: -1000, max: -180.0001, noNaN: true, noDefaultInfinity: true }),
          fc.constant(Infinity),
          fc.constant(-Infinity),
          fc.constant(NaN),
        );

        const invalidLngLocationArb = fc
          .tuple(validLocationArb, invalidLngArb)
          .map(([location, lng]) => ({ ...location, longitude: lng }));

        fc.assert(
          fc.property(invalidLngLocationArb, (value) => {
            expect(isLocation(value)).to.be.false;
          }),
          { numRuns: 100 },
        );
      });

      it('should reject objects with wrong types for fields', () => {
        const wrongTypeLocationArb = fc.oneof(
          // placeName as non-string
          validLocationArb.map((loc) => ({ ...loc, placeName: 123 })),
          validLocationArb.map((loc) => ({ ...loc, placeName: null })),
          validLocationArb.map((loc) => ({ ...loc, placeName: true })),
          // latitude as non-number
          validLocationArb.map((loc) => ({ ...loc, latitude: '45' })),
          validLocationArb.map((loc) => ({ ...loc, latitude: null })),
          validLocationArb.map((loc) => ({ ...loc, latitude: true })),
          // longitude as non-number
          validLocationArb.map((loc) => ({ ...loc, longitude: '90' })),
          validLocationArb.map((loc) => ({ ...loc, longitude: null })),
          validLocationArb.map((loc) => ({ ...loc, longitude: true })),
          // formattedAddress as non-string
          validLocationArb.map((loc) => ({ ...loc, formattedAddress: 42 })),
          validLocationArb.map((loc) => ({ ...loc, formattedAddress: null })),
          validLocationArb.map((loc) => ({ ...loc, formattedAddress: [] })),
        );

        fc.assert(
          fc.property(wrongTypeLocationArb, (value) => {
            expect(isLocation(value)).to.be.false;
          }),
          { numRuns: 100 },
        );
      });

      it('should reject objects with empty placeName', () => {
        const emptyPlaceNameArb = validLocationArb.map((loc) => ({ ...loc, placeName: '' }));

        fc.assert(
          fc.property(emptyPlaceNameArb, (value) => {
            expect(isLocation(value)).to.be.false;
          }),
          { numRuns: 100 },
        );
      });

      it('should reject objects with placeName exceeding 256 characters', () => {
        const longPlaceNameArb = fc
          .tuple(validLocationArb, fc.string({ minLength: 257, maxLength: 600 }))
          .map(([loc, longName]) => ({ ...loc, placeName: longName }));

        fc.assert(
          fc.property(longPlaceNameArb, (value) => {
            expect(isLocation(value)).to.be.false;
          }),
          { numRuns: 100 },
        );
      });

      it('should reject objects with formattedAddress exceeding 512 characters', () => {
        const longAddressArb = fc
          .tuple(validLocationArb, fc.string({ minLength: 513, maxLength: 1024 }))
          .map(([loc, longAddr]) => ({ ...loc, formattedAddress: longAddr }));

        fc.assert(
          fc.property(longAddressArb, (value) => {
            expect(isLocation(value)).to.be.false;
          }),
          { numRuns: 100 },
        );
      });

      it('should correctly classify arbitrary JSON values', () => {
        fc.assert(
          fc.property(fc.anything(), (value) => {
            const result = isLocation(value);

            // The result must be a boolean
            expect(result).to.be.a('boolean');

            // If the result is true, value must be null or a valid location
            if (result === true) {
              if (value !== null) {
                expect(_.isPlainObject(value)).to.be.true;
                expect(_.size(value)).to.equal(4);
                expect(value.placeName).to.be.a('string');
                expect(value.placeName.length).to.be.greaterThan(0);
                expect(value.placeName.length).to.be.at.most(256);
                expect(value.latitude).to.be.a('number');
                expect(value.latitude).to.be.at.least(-90);
                expect(value.latitude).to.be.at.most(90);
                expect(value.longitude).to.be.a('number');
                expect(value.longitude).to.be.at.least(-180);
                expect(value.longitude).to.be.at.most(180);
                expect(value.formattedAddress).to.be.a('string');
                expect(value.formattedAddress.length).to.be.at.most(512);
              }
            }
          }),
          { numRuns: 100 },
        );
      });
    });
  });
});
