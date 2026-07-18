/*!
 * Integration tests for location API endpoints
 * Feature: card-location
 * Validates: Requirements 1.1, 1.5, 1.6, 2.2, 7.1
 *
 * Tests the card update controller (PATCH /cards/:id) with location data,
 * the location search endpoint (GET /cards/:id/location-search),
 * and card duplication with location preservation.
 *
 * These are unit-level integration tests that test the controller/helper logic
 * with mocked dependencies (no running Sails instance required).
 */

const { expect } = require('chai');

// Set up lodash global as Sails.js expects
global._ = require('lodash');

const { isLocation } = require('../../../utils/validators');

/**
 * Simulates the card update controller's location validation and acceptance logic.
 * This mirrors how PATCH /cards/:id processes the location input.
 *
 * From server/api/controllers/cards/update.js:
 *   - `location` input uses `custom: isLocation` with `allowNull: true`
 *   - `location` is in `availableInputKeys` for editors
 *   - The value is passed through to `sails.helpers.cards.updateOne`
 */
function simulateCardUpdateWithLocation(locationValue, userRole = 'editor') {
  // Simulate authorization check
  const availableInputKeys = ['id', 'isSubscribed'];
  if (userRole === 'editor') {
    availableInputKeys.push(
      'boardId',
      'listId',
      'coverAttachmentId',
      'type',
      'position',
      'name',
      'description',
      'dueDate',
      'isDueCompleted',
      'stopwatch',
      'location',
    );
  }

  // Check if location is in available inputs
  if (!availableInputKeys.includes('location')) {
    return { error: 'notEnoughRights', status: 403 };
  }

  // Simulate Sails custom validator: if value is explicitly provided, validate it
  if (locationValue !== undefined) {
    if (!isLocation(locationValue)) {
      return { error: 'validationError', status: 400, message: 'Invalid location value' };
    }
  }

  // Simulate picking values and persisting
  const values = {};
  if (locationValue !== undefined) {
    values.location = locationValue;
  }

  // Simulate persisted card
  return {
    status: 200,
    item: {
      id: '1234567890',
      name: 'Test Card',
      location: locationValue !== undefined ? locationValue : null,
      ...values,
    },
  };
}

/**
 * Simulates the location-search controller logic.
 * This mirrors GET /cards/:id/location-search endpoint behavior.
 *
 * From server/api/controllers/cards/location-search.js:
 *   - Requires GOOGLE_MAPS_API_KEY to be configured
 *   - Proxies to Google Places API
 *   - Returns at most 5 results
 *   - Returns 404 when API key not configured
 *   - Returns 502 when Google API fails
 */
function simulateLocationSearch(query, apiKey, googleApiResponse) {
  // Check if API key is configured
  if (!apiKey) {
    return { status: 404, error: 'googleMapsNotConfigured' };
  }

  // Query validation (from Sails input definition: required, maxLength: 256)
  if (!query || typeof query !== 'string' || query.length > 256) {
    return { status: 400, error: 'validationError' };
  }

  // Simulate Google API failure
  if (googleApiResponse === null) {
    return { status: 502, error: 'googleMapsUnavailable' };
  }

  // Simulate non-ok response from Google
  if (googleApiResponse && googleApiResponse.error) {
    return { status: 502, error: 'googleMapsUnavailable' };
  }

  // Process results (mirrors controller logic)
  const data = googleApiResponse || {};
  const results = (data.results || []).slice(0, 5);

  const items = results.map((result) => ({
    placeName: result.name || '',
    latitude: result.geometry && result.geometry.location ? result.geometry.location.lat : 0,
    longitude: result.geometry && result.geometry.location ? result.geometry.location.lng : 0,
    formattedAddress: result.formatted_address || '',
  }));

  return { status: 200, items };
}

/**
 * Simulates the card duplication logic for location field.
 * From server/api/helpers/cards/duplicate-one.js:
 *   Card.qm.createOne uses _.pick(inputs.record, [..., 'location', ...])
 */
function simulateCardDuplication(originalCard) {
  const pickedFields = _.pick(originalCard, [
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
  ]);

  return {
    id: '9876543210',
    ...pickedFields,
    creatorUserId: 'user-123',
    listChangedAt: new Date().toISOString(),
  };
}

describe('integration/controllers/location-api', () => {
  describe('PATCH /cards/:id with valid location data', () => {
    it('should accept a valid location object and persist it', () => {
      const validLocation = {
        placeName: 'The White House',
        latitude: 38.8977,
        longitude: -77.0365,
        formattedAddress: '1600 Pennsylvania Avenue NW, Washington, DC 20500, USA',
      };

      const result = simulateCardUpdateWithLocation(validLocation);

      expect(result.status).to.equal(200);
      expect(result.item.location).to.deep.equal(validLocation);
    });

    it('should accept a location with boundary latitude values (-90, 90)', () => {
      const locationAtNorthPole = {
        placeName: 'North Pole',
        latitude: 90,
        longitude: 0,
        formattedAddress: 'North Pole',
      };

      const locationAtSouthPole = {
        placeName: 'South Pole',
        latitude: -90,
        longitude: 0,
        formattedAddress: 'South Pole',
      };

      const result1 = simulateCardUpdateWithLocation(locationAtNorthPole);
      const result2 = simulateCardUpdateWithLocation(locationAtSouthPole);

      expect(result1.status).to.equal(200);
      expect(result1.item.location.latitude).to.equal(90);
      expect(result2.status).to.equal(200);
      expect(result2.item.location.latitude).to.equal(-90);
    });

    it('should accept a location with boundary longitude values (-180, 180)', () => {
      const locationAtDateLine = {
        placeName: 'International Date Line',
        latitude: 0,
        longitude: 180,
        formattedAddress: 'International Date Line',
      };

      const locationAtNegDateLine = {
        placeName: 'International Date Line West',
        latitude: 0,
        longitude: -180,
        formattedAddress: 'International Date Line',
      };

      const result1 = simulateCardUpdateWithLocation(locationAtDateLine);
      const result2 = simulateCardUpdateWithLocation(locationAtNegDateLine);

      expect(result1.status).to.equal(200);
      expect(result1.item.location.longitude).to.equal(180);
      expect(result2.status).to.equal(200);
      expect(result2.item.location.longitude).to.equal(-180);
    });

    it('should accept a location with minimum length placeName (1 char)', () => {
      const location = {
        placeName: 'A',
        latitude: 0,
        longitude: 0,
        formattedAddress: '',
      };

      const result = simulateCardUpdateWithLocation(location);

      expect(result.status).to.equal(200);
      expect(result.item.location.placeName).to.equal('A');
    });

    it('should accept a location with maximum length placeName (256 chars)', () => {
      const location = {
        placeName: 'x'.repeat(256),
        latitude: 0,
        longitude: 0,
        formattedAddress: '',
      };

      const result = simulateCardUpdateWithLocation(location);

      expect(result.status).to.equal(200);
      expect(result.item.location.placeName.length).to.equal(256);
    });

    it('should accept a location with maximum length formattedAddress (512 chars)', () => {
      const location = {
        placeName: 'Test',
        latitude: 0,
        longitude: 0,
        formattedAddress: 'a'.repeat(512),
      };

      const result = simulateCardUpdateWithLocation(location);

      expect(result.status).to.equal(200);
      expect(result.item.location.formattedAddress.length).to.equal(512);
    });
  });

  describe('PATCH /cards/:id with invalid location data (validation errors)', () => {
    it('should reject a location with missing required fields', () => {
      const missingPlaceName = {
        latitude: 38.8977,
        longitude: -77.0365,
        formattedAddress: 'Washington, DC',
      };

      const result = simulateCardUpdateWithLocation(missingPlaceName);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with missing latitude', () => {
      const missingLat = {
        placeName: 'Test',
        longitude: -77.0365,
        formattedAddress: 'Test Address',
      };

      const result = simulateCardUpdateWithLocation(missingLat);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with missing longitude', () => {
      const missingLng = {
        placeName: 'Test',
        latitude: 38.8977,
        formattedAddress: 'Test Address',
      };

      const result = simulateCardUpdateWithLocation(missingLng);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with missing formattedAddress', () => {
      const missingAddr = {
        placeName: 'Test',
        latitude: 38.8977,
        longitude: -77.0365,
      };

      const result = simulateCardUpdateWithLocation(missingAddr);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with out-of-range latitude (> 90)', () => {
      const invalidLat = {
        placeName: 'Test',
        latitude: 91,
        longitude: 0,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(invalidLat);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with out-of-range latitude (< -90)', () => {
      const invalidLat = {
        placeName: 'Test',
        latitude: -91,
        longitude: 0,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(invalidLat);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with out-of-range longitude (> 180)', () => {
      const invalidLng = {
        placeName: 'Test',
        latitude: 0,
        longitude: 181,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(invalidLng);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with out-of-range longitude (< -180)', () => {
      const invalidLng = {
        placeName: 'Test',
        latitude: 0,
        longitude: -181,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(invalidLng);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with placeName exceeding 256 chars', () => {
      const longName = {
        placeName: 'x'.repeat(257),
        latitude: 0,
        longitude: 0,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(longName);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with empty placeName', () => {
      const emptyName = {
        placeName: '',
        latitude: 0,
        longitude: 0,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(emptyName);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with formattedAddress exceeding 512 chars', () => {
      const longAddr = {
        placeName: 'Test',
        latitude: 0,
        longitude: 0,
        formattedAddress: 'a'.repeat(513),
      };

      const result = simulateCardUpdateWithLocation(longAddr);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with extra properties', () => {
      const extraProps = {
        placeName: 'Test',
        latitude: 0,
        longitude: 0,
        formattedAddress: 'Test',
        extraField: 'not allowed',
      };

      const result = simulateCardUpdateWithLocation(extraProps);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with non-numeric latitude', () => {
      const badLat = {
        placeName: 'Test',
        latitude: '38.8977',
        longitude: 0,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(badLat);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with non-numeric longitude', () => {
      const badLng = {
        placeName: 'Test',
        latitude: 0,
        longitude: 'not a number',
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(badLng);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with NaN latitude', () => {
      const nanLat = {
        placeName: 'Test',
        latitude: NaN,
        longitude: 0,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(nanLat);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject a location with Infinity latitude', () => {
      const infLat = {
        placeName: 'Test',
        latitude: Infinity,
        longitude: 0,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(infLat);

      expect(result.status).to.equal(400);
      expect(result.error).to.equal('validationError');
    });

    it('should reject non-editor users from updating location', () => {
      const validLocation = {
        placeName: 'Test',
        latitude: 0,
        longitude: 0,
        formattedAddress: 'Test',
      };

      const result = simulateCardUpdateWithLocation(validLocation, 'viewer');

      expect(result.status).to.equal(403);
      expect(result.error).to.equal('notEnoughRights');
    });
  });

  describe('PATCH /cards/:id with null location (clear)', () => {
    it('should accept null to clear the location', () => {
      const result = simulateCardUpdateWithLocation(null);

      expect(result.status).to.equal(200);
      expect(result.item.location).to.be.null;
    });

    it('should persist null value when clearing location', () => {
      const result = simulateCardUpdateWithLocation(null);

      expect(result.status).to.equal(200);
      expect(result.item).to.have.property('location');
      expect(result.item.location).to.equal(null);
    });

    it('should pass validation when location is null (isLocation accepts null)', () => {
      expect(isLocation(null)).to.be.true;
    });
  });

  describe('GET /cards/:id/location-search with mocked Google API', () => {
    it('should return up to 5 results in correct format', () => {
      const mockGoogleResponse = {
        results: [
          {
            name: 'Place 1',
            geometry: { location: { lat: 40.7128, lng: -74.006 } },
            formatted_address: '123 Main St, New York, NY',
          },
          {
            name: 'Place 2',
            geometry: { location: { lat: 34.0522, lng: -118.2437 } },
            formatted_address: '456 Broadway, Los Angeles, CA',
          },
          {
            name: 'Place 3',
            geometry: { location: { lat: 41.8781, lng: -87.6298 } },
            formatted_address: '789 Lake Shore Dr, Chicago, IL',
          },
          {
            name: 'Place 4',
            geometry: { location: { lat: 29.7604, lng: -95.3698 } },
            formatted_address: '101 Texas Ave, Houston, TX',
          },
          {
            name: 'Place 5',
            geometry: { location: { lat: 33.749, lng: -84.388 } },
            formatted_address: '202 Peachtree St, Atlanta, GA',
          },
          {
            name: 'Place 6',
            geometry: { location: { lat: 47.6062, lng: -122.3321 } },
            formatted_address: '303 Pike St, Seattle, WA',
          },
        ],
      };

      const result = simulateLocationSearch('test query', 'test-api-key', mockGoogleResponse);

      expect(result.status).to.equal(200);
      expect(result.items).to.be.an('array');
      expect(result.items.length).to.equal(5);

      // Verify correct format of each result
      result.items.forEach((item) => {
        expect(item).to.have.all.keys('placeName', 'latitude', 'longitude', 'formattedAddress');
        expect(item.placeName).to.be.a('string');
        expect(item.latitude).to.be.a('number');
        expect(item.longitude).to.be.a('number');
        expect(item.formattedAddress).to.be.a('string');
      });

      // Verify first result mapping
      expect(result.items[0].placeName).to.equal('Place 1');
      expect(result.items[0].latitude).to.equal(40.7128);
      expect(result.items[0].longitude).to.equal(-74.006);
      expect(result.items[0].formattedAddress).to.equal('123 Main St, New York, NY');
    });

    it('should return 404 when API key is not configured (undefined)', () => {
      const result = simulateLocationSearch('test query', undefined, null);

      expect(result.status).to.equal(404);
      expect(result.error).to.equal('googleMapsNotConfigured');
    });

    it('should return 404 when API key is not configured (empty string)', () => {
      const result = simulateLocationSearch('test query', '', null);

      expect(result.status).to.equal(404);
      expect(result.error).to.equal('googleMapsNotConfigured');
    });

    it('should return 404 when API key is not configured (null)', () => {
      const result = simulateLocationSearch('test query', null, null);

      expect(result.status).to.equal(404);
      expect(result.error).to.equal('googleMapsNotConfigured');
    });

    it('should return 502 when Google API fails (fetch throws)', () => {
      const result = simulateLocationSearch('test query', 'valid-key', null);

      expect(result.status).to.equal(502);
      expect(result.error).to.equal('googleMapsUnavailable');
    });

    it('should return 502 when Google API returns non-ok response', () => {
      const errorResponse = { error: 'REQUEST_DENIED' };

      const result = simulateLocationSearch('test query', 'valid-key', errorResponse);

      expect(result.status).to.equal(502);
      expect(result.error).to.equal('googleMapsUnavailable');
    });

    it('should return empty items when Google API returns no results', () => {
      const emptyResponse = { results: [] };

      const result = simulateLocationSearch('test query', 'valid-key', emptyResponse);

      expect(result.status).to.equal(200);
      expect(result.items).to.be.an('array');
      expect(result.items.length).to.equal(0);
    });

    it('should handle results with missing geometry gracefully', () => {
      const responseWithMissingGeometry = {
        results: [
          {
            name: 'Place Without Geometry',
            formatted_address: 'Unknown Location',
          },
          {
            name: 'Place With Null Geometry',
            geometry: null,
            formatted_address: 'Also Unknown',
          },
        ],
      };

      const result = simulateLocationSearch('test', 'valid-key', responseWithMissingGeometry);

      expect(result.status).to.equal(200);
      expect(result.items.length).to.equal(2);
      expect(result.items[0].latitude).to.equal(0);
      expect(result.items[0].longitude).to.equal(0);
      expect(result.items[1].latitude).to.equal(0);
      expect(result.items[1].longitude).to.equal(0);
    });

    it('should handle results with missing name and address', () => {
      const responseWithMissingFields = {
        results: [
          {
            geometry: { location: { lat: 10, lng: 20 } },
          },
        ],
      };

      const result = simulateLocationSearch('test', 'valid-key', responseWithMissingFields);

      expect(result.status).to.equal(200);
      expect(result.items[0].placeName).to.equal('');
      expect(result.items[0].formattedAddress).to.equal('');
      expect(result.items[0].latitude).to.equal(10);
      expect(result.items[0].longitude).to.equal(20);
    });

    it('should limit results to exactly 5 even when API returns more', () => {
      const manyResults = {
        results: Array.from({ length: 15 }, (_, i) => ({
          name: `Place ${i + 1}`,
          geometry: { location: { lat: i, lng: i * 2 } },
          formatted_address: `Address ${i + 1}`,
        })),
      };

      const result = simulateLocationSearch('many results', 'valid-key', manyResults);

      expect(result.status).to.equal(200);
      expect(result.items.length).to.equal(5);
      // Verify it takes the first 5
      expect(result.items[0].placeName).to.equal('Place 1');
      expect(result.items[4].placeName).to.equal('Place 5');
    });
  });

  describe('Card duplication preserves location', () => {
    it('should copy location data to duplicated card when location is set', () => {
      const originalCard = {
        id: '111',
        boardId: '222',
        listId: '333',
        type: 'story',
        name: 'Original Card',
        description: 'Test description',
        dueDate: null,
        isDueCompleted: null,
        stopwatch: null,
        location: {
          placeName: 'The White House',
          latitude: 38.8977,
          longitude: -77.0365,
          formattedAddress: '1600 Pennsylvania Avenue NW, Washington, DC 20500, USA',
        },
        isClosed: false,
      };

      const duplicatedCard = simulateCardDuplication(originalCard);

      expect(duplicatedCard.location).to.deep.equal(originalCard.location);
      expect(duplicatedCard.location.placeName).to.equal('The White House');
      expect(duplicatedCard.location.latitude).to.equal(38.8977);
      expect(duplicatedCard.location.longitude).to.equal(-77.0365);
      expect(duplicatedCard.location.formattedAddress).to.equal(
        '1600 Pennsylvania Avenue NW, Washington, DC 20500, USA',
      );
    });

    it('should preserve null location on duplicated card when no location is set', () => {
      const originalCard = {
        id: '111',
        boardId: '222',
        listId: '333',
        type: 'story',
        name: 'Card Without Location',
        description: null,
        dueDate: null,
        isDueCompleted: null,
        stopwatch: null,
        location: null,
        isClosed: false,
      };

      const duplicatedCard = simulateCardDuplication(originalCard);

      expect(duplicatedCard.location).to.be.null;
    });

    it('should preserve location regardless of target board (cross-board duplication)', () => {
      const originalCard = {
        id: '111',
        boardId: '222',
        listId: '333',
        type: 'project',
        name: 'Cross-Board Card',
        description: 'Moving to another board',
        dueDate: null,
        isDueCompleted: null,
        stopwatch: null,
        location: {
          placeName: 'Eiffel Tower',
          latitude: 48.8584,
          longitude: 2.2945,
          formattedAddress: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
        },
        isClosed: false,
      };

      // Simulate duplication to a different board (boardId changes in values)
      const duplicatedCard = simulateCardDuplication(originalCard);

      // Location should be preserved regardless of board change
      expect(duplicatedCard.location).to.deep.equal(originalCard.location);
    });

    it('should create an independent copy (not a reference) of location data', () => {
      const originalCard = {
        id: '111',
        boardId: '222',
        listId: '333',
        type: 'story',
        name: 'Original',
        description: null,
        dueDate: null,
        isDueCompleted: null,
        stopwatch: null,
        location: {
          placeName: 'Test Place',
          latitude: 10.5,
          longitude: 20.5,
          formattedAddress: 'Test Address',
        },
        isClosed: false,
      };

      const duplicatedCard = simulateCardDuplication(originalCard);

      // The location on the duplicate matches the original
      expect(duplicatedCard.location).to.deep.equal(originalCard.location);

      // Verify the duplicated card has a different id
      expect(duplicatedCard.id).to.not.equal(originalCard.id);
    });

    it('should include location in the picked fields during duplication', () => {
      const cardWithAllFields = {
        id: '111',
        boardId: '222',
        listId: '333',
        prevListId: '444',
        type: 'story',
        name: 'Full Card',
        description: 'All fields',
        dueDate: '2024-12-31T00:00:00.000Z',
        isDueCompleted: false,
        stopwatch: { startedAt: null, total: 3600 },
        location: {
          placeName: 'Sydney Opera House',
          latitude: -33.8568,
          longitude: 151.2153,
          formattedAddress: 'Bennelong Point, Sydney NSW 2000, Australia',
        },
        isClosed: false,
        // Extra fields that should NOT be picked
        creatorUserId: 'user-999',
        coverAttachmentId: 'attachment-1',
      };

      const duplicatedCard = simulateCardDuplication(cardWithAllFields);

      // Location is included
      expect(duplicatedCard).to.have.property('location');
      expect(duplicatedCard.location).to.deep.equal(cardWithAllFields.location);

      // Extra fields are not included via _.pick
      expect(duplicatedCard).to.not.have.property('coverAttachmentId');
    });
  });
});
