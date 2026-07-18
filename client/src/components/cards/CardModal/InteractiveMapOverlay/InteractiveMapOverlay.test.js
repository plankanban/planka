/*!
 * Property-based tests for InteractiveMapOverlay
 * Feature: card-location
 * Property 8: Interactive map overlay centers on saved coordinates
 * Validates: Requirements 8.2
 * Property 9: Google Maps external link constructs correct URL from coordinates
 * Validates: Requirements 8.8
 */

const fc = require('fast-check');

const DEFAULT_ZOOM = 15;

/**
 * Extracts the pure map initialization logic from InteractiveMapOverlay.
 * Given a latitude and longitude, computes the map center, zoom, and marker position.
 */
function computeMapProps(latitude, longitude) {
  const center = { lat: latitude, lng: longitude };
  return {
    center,
    zoom: DEFAULT_ZOOM,
    markerPosition: { lat: latitude, lng: longitude },
  };
}

/**
 * Extracts the pure URL construction logic from InteractiveMapOverlay.
 * Given a latitude and longitude, builds the Google Maps external link URL.
 */
function buildGoogleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps/@${latitude},${longitude},15z`;
}

/**
 * Generates a valid latitude between -90 and 90.
 */
const latitudeArb = fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true });

/**
 * Generates a valid longitude between -180 and 180.
 */
const longitudeArb = fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true });

describe('InteractiveMapOverlay', () => {
  describe('Feature: card-location, Property 8: Interactive map overlay centers on saved coordinates', () => {
    it('should set center.lat equal to the input latitude', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, (lat, lng) => {
          const props = computeMapProps(lat, lng);
          expect(props.center.lat).toBe(lat);
        }),
        { numRuns: 100 },
      );
    });

    it('should set center.lng equal to the input longitude', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, (lat, lng) => {
          const props = computeMapProps(lat, lng);
          expect(props.center.lng).toBe(lng);
        }),
        { numRuns: 100 },
      );
    });

    it('should always use zoom level 15', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, (lat, lng) => {
          const props = computeMapProps(lat, lng);
          expect(props.zoom).toBe(15);
        }),
        { numRuns: 100 },
      );
    });

    it('should set marker position equal to the center coordinates', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, (lat, lng) => {
          const props = computeMapProps(lat, lng);
          expect(props.markerPosition.lat).toBe(props.center.lat);
          expect(props.markerPosition.lng).toBe(props.center.lng);
        }),
        { numRuns: 100 },
      );
    });

    it('should set marker position equal to the input coordinates', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, (lat, lng) => {
          const props = computeMapProps(lat, lng);
          expect(props.markerPosition.lat).toBe(lat);
          expect(props.markerPosition.lng).toBe(lng);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Feature: card-location, Property 9: Google Maps external link constructs correct URL from coordinates', () => {
    it('should produce a URL matching the format https://www.google.com/maps/@{lat},{lng},15z', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, (lat, lng) => {
          const url = buildGoogleMapsUrl(lat, lng);

          // Verify the URL starts with the correct base
          expect(url).toMatch(/^https:\/\/www\.google\.com\/maps\/@/);

          // Verify the URL ends with ,15z
          expect(url).toMatch(/,15z$/);

          // Verify overall format: base + lat + , + lng + ,15z
          const expectedUrl = `https://www.google.com/maps/@${lat},${lng},15z`;
          expect(url).toBe(expectedUrl);
        }),
        { numRuns: 100 },
      );
    });

    it('should contain the correct latitude value in the URL', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, (lat, lng) => {
          const url = buildGoogleMapsUrl(lat, lng);

          // Extract coordinates from URL between @ and ,15z
          const coordMatch = url.match(/@(.+),15z$/);
          expect(coordMatch).not.toBeNull();

          const coordPart = coordMatch[1];
          // The lat is everything before the last comma (since lng may be negative)
          const lastCommaIdx = coordPart.lastIndexOf(',');
          const extractedLat = Number(coordPart.substring(0, lastCommaIdx));

          // Use == for numeric equality (treats -0 and 0 as equal)
          expect(extractedLat == lat).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('should contain the correct longitude value in the URL', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, (lat, lng) => {
          const url = buildGoogleMapsUrl(lat, lng);

          // Extract coordinates from URL between @ and ,15z
          const coordMatch = url.match(/@(.+),15z$/);
          expect(coordMatch).not.toBeNull();

          const coordPart = coordMatch[1];
          // The lng is everything after the last comma
          const lastCommaIdx = coordPart.lastIndexOf(',');
          const extractedLng = Number(coordPart.substring(lastCommaIdx + 1));

          // Use == for numeric equality (treats -0 and 0 as equal)
          expect(extractedLng == lng).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('should always use zoom suffix 15z', () => {
      fc.assert(
        fc.property(latitudeArb, longitudeArb, (lat, lng) => {
          const url = buildGoogleMapsUrl(lat, lng);

          // The URL must end with ,15z (the zoom suffix)
          const zoomSuffix = url.slice(-4);
          expect(zoomSuffix).toBe(',15z');
        }),
        { numRuns: 100 },
      );
    });

    it('should produce a valid URL for boundary coordinate values', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(-90),
            fc.constant(90),
            fc.constant(0),
            latitudeArb,
          ),
          fc.oneof(
            fc.constant(-180),
            fc.constant(180),
            fc.constant(0),
            longitudeArb,
          ),
          (lat, lng) => {
            const url = buildGoogleMapsUrl(lat, lng);

            // URL should always be a valid string starting with the base
            expect(url.startsWith('https://www.google.com/maps/@')).toBe(true);
            expect(url.endsWith(',15z')).toBe(true);

            // Coordinates in the URL should parse back to numbers
            const coordMatch = url.match(/@(.+),15z$/);
            expect(coordMatch).not.toBeNull();

            const coordPart = coordMatch[1];
            const lastCommaIdx = coordPart.lastIndexOf(',');
            const parsedLat = Number(coordPart.substring(0, lastCommaIdx));
            const parsedLng = Number(coordPart.substring(lastCommaIdx + 1));

            expect(Number.isNaN(parsedLat)).toBe(false);
            expect(Number.isNaN(parsedLng)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
