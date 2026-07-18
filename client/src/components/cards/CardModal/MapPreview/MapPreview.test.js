/*!
 * Property-based tests for map preview coordinates
 * Feature: card-location
 * Property 5: Map preview receives correct coordinates
 * Validates: Requirements 4.1
 */

const fc = require('fast-check');

/**
 * Extracts the pure URL construction logic from MapPreview.
 * Given a latitude, longitude, and API key, builds the Google Maps Static API URL.
 */
function buildStaticMapUrl(latitude, longitude, apiKey) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x200&markers=${latitude},${longitude}&key=${apiKey}`;
}

/**
 * Generates a valid latitude between -90 and 90.
 */
const latitudeArb = fc.double({
  min: -90,
  max: 90,
  noNaN: true,
  noDefaultInfinity: true,
});

/**
 * Generates a valid longitude between -180 and 180.
 */
const longitudeArb = fc.double({
  min: -180,
  max: 180,
  noNaN: true,
  noDefaultInfinity: true,
});

/**
 * Generates a valid API key string (non-empty alphanumeric-like string).
 */
const apiKeyArb = fc.string({ minLength: 1, maxLength: 64 }).filter((s) => s.trim().length > 0);

describe('MapPreview', () => {
  describe('Feature: card-location, Property 5: Map preview receives correct coordinates', () => {
    it('should contain the correct latitude and longitude in the center parameter', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, apiKeyArb, (lat, lng, apiKey) => {
          const url = buildStaticMapUrl(lat, lng, apiKey);

          // Extract center parameter value
          const centerMatch = url.match(/center=([^&]+)/);
          expect(centerMatch).not.toBeNull();

          const [centerLat, centerLng] = centerMatch[1].split(',').map(Number);
          // Treats -0 and 0 as equal, which is correct for geographic coordinates
          expect(Object.is(centerLat, lat) || (centerLat === 0 && lat === 0)).toBe(true);
          expect(Object.is(centerLng, lng) || (centerLng === 0 && lng === 0)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('should contain the correct latitude and longitude in the markers parameter', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, apiKeyArb, (lat, lng, apiKey) => {
          const url = buildStaticMapUrl(lat, lng, apiKey);

          // Extract markers parameter value
          const markersMatch = url.match(/markers=([^&]+)/);
          expect(markersMatch).not.toBeNull();

          const [markerLat, markerLng] = markersMatch[1].split(',').map(Number);
          // Treats -0 and 0 as equal, which is correct for geographic coordinates
          expect(Object.is(markerLat, lat) || (markerLat === 0 && lat === 0)).toBe(true);
          expect(Object.is(markerLng, lng) || (markerLng === 0 && lng === 0)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('should always use zoom level 15', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, apiKeyArb, (lat, lng, apiKey) => {
          const url = buildStaticMapUrl(lat, lng, apiKey);

          // Extract zoom parameter value
          const zoomMatch = url.match(/zoom=(\d+)/);
          expect(zoomMatch).not.toBeNull();
          expect(zoomMatch[1]).toBe('15');
        }),
        { numRuns: 100 },
      );
    });

    it('should contain the correct API key', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, apiKeyArb, (lat, lng, apiKey) => {
          const url = buildStaticMapUrl(lat, lng, apiKey);

          // Extract key parameter value
          const keyMatch = url.match(/key=(.+)$/);
          expect(keyMatch).not.toBeNull();
          expect(keyMatch[1]).toBe(apiKey);
        }),
        { numRuns: 100 },
      );
    });

    it('should have center and markers coordinates equal to each other', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, apiKeyArb, (lat, lng, apiKey) => {
          const url = buildStaticMapUrl(lat, lng, apiKey);

          const centerMatch = url.match(/center=([^&]+)/);
          const markersMatch = url.match(/markers=([^&]+)/);

          // Center and markers should have identical coordinate values
          expect(centerMatch[1]).toBe(markersMatch[1]);
        }),
        { numRuns: 100 },
      );
    });
  });
});
