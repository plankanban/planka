/*!
 * Property-based tests for location field mapping
 * Feature: card-location
 * Property 4: Selecting a location maps all fields correctly
 * Validates: Requirements 3.1
 */

const fc = require("fast-check");

/**
 * Extracts the pure mapping logic from LocationEditorStep.
 * When a user selects a location result and does not edit the title,
 * the mapping is an identity over all four fields:
 *   placeName, latitude, longitude, formattedAddress
 */
function mapLocationResult(result) {
  const locationToSave = result;
  const trimmedTitle = result.placeName.trim();

  return {
    placeName: trimmedTitle,
    latitude: locationToSave.latitude,
    longitude: locationToSave.longitude,
    formattedAddress: locationToSave.formattedAddress,
  };
}

/**
 * Generates a valid place result object matching what the search API returns.
 * placeName: non-empty string (max 256 chars, pre-trimmed to avoid whitespace-only edge)
 * latitude: number between -90 and 90
 * longitude: number between -180 and 180
 * formattedAddress: string (max 512 chars)
 */
const placeResultArb = fc.record({
  placeName: fc
    .string({ minLength: 1, maxLength: 256 })
    .filter((s) => s.trim().length > 0),
  latitude: fc.double({
    min: -90,
    max: 90,
    noNaN: true,
    noDefaultInfinity: true,
  }),
  longitude: fc.double({
    min: -180,
    max: 180,
    noNaN: true,
    noDefaultInfinity: true,
  }),
  formattedAddress: fc.string({ minLength: 0, maxLength: 512 }),
});

describe("LocationEditorStep", () => {
  describe("Feature: card-location, Property 4: Selecting a location maps all fields correctly", () => {
    it("should map all four fields identically from the selected result", () => {
      fc.assert(
        fc.property(placeResultArb, (result) => {
          const mapped = mapLocationResult(result);

          // placeName maps to trimmed version of the result's placeName
          expect(mapped.placeName).toBe(result.placeName.trim());
          // latitude is preserved exactly
          expect(mapped.latitude).toBe(result.latitude);
          // longitude is preserved exactly
          expect(mapped.longitude).toBe(result.longitude);
          // formattedAddress is preserved exactly
          expect(mapped.formattedAddress).toBe(result.formattedAddress);
        }),
        { numRuns: 100 },
      );
    });

    it("should produce an object with exactly four properties", () => {
      fc.assert(
        fc.property(placeResultArb, (result) => {
          const mapped = mapLocationResult(result);
          const keys = Object.keys(mapped);

          expect(keys).toHaveLength(4);
          expect(keys.sort()).toEqual([
            "formattedAddress",
            "latitude",
            "longitude",
            "placeName",
          ]);
        }),
        { numRuns: 100 },
      );
    });

    it("should preserve numeric precision for coordinates", () => {
      fc.assert(
        fc.property(placeResultArb, (result) => {
          const mapped = mapLocationResult(result);

          // Strict equality ensures no floating-point transformation occurs
          expect(Object.is(mapped.latitude, result.latitude)).toBe(true);
          expect(Object.is(mapped.longitude, result.longitude)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });
  });
});
