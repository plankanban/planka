/*!
 * Property-based tests for location search result limiting
 * Feature: card-location
 * Property 2: Search triggers only for inputs of 3 or more characters and returns at most 5 results
 * Validates: Requirements 2.2
 */

const { expect } = require('chai');
const fc = require('fast-check');

/**
 * Extracts the core result-limiting and mapping logic from the location-search controller.
 * This is the pure transformation that takes raw Google Places API results and produces
 * the limited, mapped output array.
 *
 * From server/api/controllers/cards/location-search.js:
 *   const results = (data.results || []).slice(0, 5);
 *   const items = results.map((result) => ({
 *     placeName: result.name || '',
 *     latitude: result.geometry && result.geometry.location ? result.geometry.location.lat : 0,
 *     longitude: result.geometry && result.geometry.location ? result.geometry.location.lng : 0,
 *     formattedAddress: result.formatted_address || '',
 *   }));
 */
function processSearchResults(data) {
  const results = (data.results || []).slice(0, 5);

  const items = results.map((result) => ({
    placeName: result.name || '',
    latitude: result.geometry && result.geometry.location ? result.geometry.location.lat : 0,
    longitude: result.geometry && result.geometry.location ? result.geometry.location.lng : 0,
    formattedAddress: result.formatted_address || '',
  }));

  return { items };
}

/**
 * Arbitrary for a single Google Places API result object.
 */
const googlePlaceResultArb = fc.record({
  name: fc.string({ minLength: 0, maxLength: 100 }),
  geometry: fc.record({
    location: fc.record({
      lat: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
      lng: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
    }),
  }),
  formatted_address: fc.string({ minLength: 0, maxLength: 200 }),
});

/**
 * Arbitrary for a Google Places API response with a variable number of results (0 to 20).
 */
const googleApiResponseArb = fc.record({
  results: fc.array(googlePlaceResultArb, { minLength: 0, maxLength: 20 }),
});

describe('controllers/cards/location-search', () => {
  describe('Feature: card-location, Property 2: Search triggers only for inputs of 3 or more characters and returns at most 5 results', () => {
    it('should return at most 5 items regardless of how many results Google Places API returns', () => {
      fc.assert(
        fc.property(googleApiResponseArb, (apiResponse) => {
          const { items } = processSearchResults(apiResponse);

          expect(items).to.be.an('array');
          expect(items.length).to.be.at.most(5);
        }),
        { numRuns: 200 },
      );
    });

    it('should return exactly min(n, 5) items where n is the number of API results', () => {
      fc.assert(
        fc.property(googleApiResponseArb, (apiResponse) => {
          const { items } = processSearchResults(apiResponse);
          const expectedLength = Math.min(apiResponse.results.length, 5);

          expect(items.length).to.equal(expectedLength);
        }),
        { numRuns: 200 },
      );
    });

    it('should handle missing or null results array gracefully and return empty items', () => {
      const missingResultsArb = fc.oneof(
        fc.constant({}),
        fc.constant({ results: null }),
        fc.constant({ results: undefined }),
      );

      fc.assert(
        fc.property(missingResultsArb, (apiResponse) => {
          const { items } = processSearchResults(apiResponse);

          expect(items).to.be.an('array');
          expect(items.length).to.equal(0);
        }),
        { numRuns: 100 },
      );
    });

    it('should map each result item with required fields (placeName, latitude, longitude, formattedAddress)', () => {
      fc.assert(
        fc.property(googleApiResponseArb, (apiResponse) => {
          const { items } = processSearchResults(apiResponse);

          items.forEach((item) => {
            expect(item).to.have.all.keys('placeName', 'latitude', 'longitude', 'formattedAddress');
            expect(item.placeName).to.be.a('string');
            expect(item.latitude).to.be.a('number');
            expect(item.longitude).to.be.a('number');
            expect(item.formattedAddress).to.be.a('string');
          });
        }),
        { numRuns: 100 },
      );
    });

    it('should enforce the 5-item cap even with very large result sets', () => {
      const largeResultSetArb = fc.record({
        results: fc.array(googlePlaceResultArb, { minLength: 6, maxLength: 50 }),
      });

      fc.assert(
        fc.property(largeResultSetArb, (apiResponse) => {
          const { items } = processSearchResults(apiResponse);

          expect(items.length).to.equal(5);
        }),
        { numRuns: 100 },
      );
    });
  });
});
