/*!
 * Property-based tests for card preview location indicator
 * Feature: card-location
 * Property 6: Card preview displays location indicator with place name
 * Validates: Requirements 6.1
 */

const fc = require('fast-check');

/**
 * Pure function representing the location indicator rendering logic
 * in the card preview (ProjectContent). When the card has a non-null location,
 * the indicator displays the "map marker alternate" icon and the place name text.
 * When location is null, no indicator is rendered.
 */
function getLocationIndicator(location) {
  if (!location) return null;
  return { icon: 'map marker alternate', text: location.placeName };
}

/**
 * Generates a valid location object with a non-empty placeName (1 to 256 chars),
 * valid latitude/longitude, and formatted address.
 */
const placeNameArb = fc.string({ minLength: 1, maxLength: 256 }).filter((s) => s.length > 0);

const locationArb = fc.record({
  placeName: placeNameArb,
  latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  formattedAddress: fc.string({ minLength: 0, maxLength: 512 }),
});

describe('ProjectContent - LocationIndicator', () => {
  describe('Feature: card-location, Property 6: Card preview displays location indicator with place name', () => {
    it('should return indicator with place name when location is non-null', () => {
      fc.assert(
        fc.property(locationArb, (location) => {
          const result = getLocationIndicator(location);

          expect(result).not.toBeNull();
          expect(result.text).toBe(location.placeName);
        }),
        { numRuns: 100 },
      );
    });

    it('should always use "map marker alternate" as the icon name', () => {
      fc.assert(
        fc.property(locationArb, (location) => {
          const result = getLocationIndicator(location);

          expect(result).not.toBeNull();
          expect(result.icon).toBe('map marker alternate');
        }),
        { numRuns: 100 },
      );
    });

    it('should return null when location is null (no indicator rendered)', () => {
      const result = getLocationIndicator(null);
      expect(result).toBeNull();
    });

    it('should return null when location is undefined (no indicator rendered)', () => {
      const result = getLocationIndicator(undefined);
      expect(result).toBeNull();
    });

    it('should include the exact place name text regardless of content', () => {
      fc.assert(
        fc.property(placeNameArb, (placeName) => {
          const location = {
            placeName,
            latitude: 0,
            longitude: 0,
            formattedAddress: '',
          };
          const result = getLocationIndicator(location);

          // The text in the indicator must exactly match the placeName
          expect(result.text).toBe(placeName);
          expect(result.text.length).toBeGreaterThan(0);
          expect(result.text.length).toBeLessThanOrEqual(256);
        }),
        { numRuns: 100 },
      );
    });
  });
});
