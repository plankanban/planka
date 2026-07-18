/*!
 * Property-based tests for search result ordering and field presence
 * Feature: card-location
 * Property 3: Search results preserve order and contain required fields
 * Validates: Requirements 2.4
 */

const { expect } = require('chai');
const fc = require('fast-check');

/**
 * Extracts the core result-processing logic from the location-search controller.
 * This is the pure transformation that takes raw Google Places API results,
 * limits them to 5, and maps them to the client-facing format.
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
 * Simulates the client-side rendering logic from LocationEditorStep.jsx:
 *   results.slice(0, 5).map((result, index) => ...)
 *
 * This represents how the client receives and displays search results.
 * It preserves order and expects each result to have the required fields.
 */
function renderSearchResults(items) {
  return items.slice(0, 5).map((result) => ({
    placeName: result.placeName,
    formattedAddress: result.formattedAddress,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}

/**
 * Arbitrary for a single Google Places API result object with identifiable data.
 */
const googlePlaceResultArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  geometry: fc.record({
    location: fc.record({
      lat: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
      lng: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
    }),
  }),
  formatted_address: fc.string({ minLength: 0, maxLength: 200 }),
});

/**
 * Arbitrary for a Google Places API response with 0-5 results (within client display limit).
 */
const googleApiResponseArb = fc.record({
  results: fc.array(googlePlaceResultArb, { minLength: 0, maxLength: 5 }),
});

/**
 * Arbitrary for a Google Places API response with more than 5 results to test slicing.
 */
const googleApiLargeResponseArb = fc.record({
  results: fc.array(googlePlaceResultArb, { minLength: 0, maxLength: 20 }),
});

describe('controllers/cards/location-search', () => {
  describe('Feature: card-location, Property 3: Search results preserve order and contain required fields', () => {
    it('should preserve the order of results from input to output (result[i] in input maps to result[i] in output)', () => {
      fc.assert(
        fc.property(googleApiLargeResponseArb, (apiResponse) => {
          const { items } = processSearchResults(apiResponse);
          const expectedSlice = apiResponse.results.slice(0, 5);

          // Verify order is preserved: each item at index i corresponds to input at index i
          for (let i = 0; i < items.length; i++) {
            const inputResult = expectedSlice[i];
            const outputItem = items[i];

            expect(outputItem.placeName).to.equal(inputResult.name || '');
            expect(outputItem.latitude).to.equal(
              inputResult.geometry && inputResult.geometry.location
                ? inputResult.geometry.location.lat
                : 0,
            );
            expect(outputItem.longitude).to.equal(
              inputResult.geometry && inputResult.geometry.location
                ? inputResult.geometry.location.lng
                : 0,
            );
            expect(outputItem.formattedAddress).to.equal(inputResult.formatted_address || '');
          }
        }),
        { numRuns: 200 },
      );
    });

    it('should contain all four required fields (placeName, latitude, longitude, formattedAddress) on every result', () => {
      fc.assert(
        fc.property(googleApiLargeResponseArb, (apiResponse) => {
          const { items } = processSearchResults(apiResponse);

          items.forEach((item) => {
            expect(item).to.have.all.keys(
              'placeName',
              'latitude',
              'longitude',
              'formattedAddress',
            );
            expect(item.placeName).to.be.a('string');
            expect(item.latitude).to.be.a('number');
            expect(item.longitude).to.be.a('number');
            expect(item.formattedAddress).to.be.a('string');
          });
        }),
        { numRuns: 200 },
      );
    });

    it('should preserve order through the full pipeline (server processing + client rendering)', () => {
      fc.assert(
        fc.property(googleApiResponseArb, (apiResponse) => {
          // Server processes API response
          const { items } = processSearchResults(apiResponse);

          // Client renders the results (simulates LocationEditorStep display logic)
          const rendered = renderSearchResults(items);

          // Verify full pipeline preserves order
          expect(rendered.length).to.equal(items.length);
          for (let i = 0; i < rendered.length; i++) {
            expect(rendered[i].placeName).to.equal(items[i].placeName);
            expect(rendered[i].formattedAddress).to.equal(items[i].formattedAddress);
            expect(rendered[i].latitude).to.equal(items[i].latitude);
            expect(rendered[i].longitude).to.equal(items[i].longitude);
          }
        }),
        { numRuns: 200 },
      );
    });

    it('should render results in the same relative order even when input has many results (sliced to 5)', () => {
      const largeResultSetArb = fc.record({
        results: fc.array(googlePlaceResultArb, { minLength: 6, maxLength: 20 }),
      });

      fc.assert(
        fc.property(largeResultSetArb, (apiResponse) => {
          const { items } = processSearchResults(apiResponse);
          const rendered = renderSearchResults(items);

          // Only first 5 should be rendered, in the same order as the original first 5
          expect(rendered.length).to.equal(5);

          const originalFirst5 = apiResponse.results.slice(0, 5);
          for (let i = 0; i < 5; i++) {
            expect(rendered[i].placeName).to.equal(originalFirst5[i].name || '');
            expect(rendered[i].formattedAddress).to.equal(
              originalFirst5[i].formatted_address || '',
            );
          }
        }),
        { numRuns: 100 },
      );
    });

    it('should produce an empty rendered list when API returns no results (preserving trivial order)', () => {
      const emptyResponseArb = fc.constant({ results: [] });

      fc.assert(
        fc.property(emptyResponseArb, (apiResponse) => {
          const { items } = processSearchResults(apiResponse);
          const rendered = renderSearchResults(items);

          expect(rendered).to.be.an('array');
          expect(rendered.length).to.equal(0);
        }),
        { numRuns: 100 },
      );
    });
  });
});
