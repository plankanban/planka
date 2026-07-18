# Implementation Plan: Card Location

## Overview

This plan implements location support for cards in Planka, enabling Google Maps-powered place search, location persistence, map previews, and an interactive map overlay. The implementation follows the existing Sails.js + React + Redux ORM patterns in the codebase.

## Tasks

- [x] 1. Database and server-side model setup
  - [x] 1.1 Create database migration to add location column to card table
    - Create migration file `server/db/migrations/YYYYMMDDHHMMSS_add_location_to_cards.js`
    - Add `location` jsonb column with default null to the `card` table
    - Include down migration to drop the column
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Extend Card model with location attribute
    - Add `location` attribute of type `json` to `server/api/models/Card.js`
    - _Requirements: 1.1, 1.2_

  - [x] 1.3 Implement location validator utility
    - Add `isLocation` function to `server/utils/validators.js`
    - Validate null (returns true), non-object (returns false), object with exactly 4 required properties
    - Validate placeName: non-empty string, max 256 chars
    - Validate latitude: number between -90 and 90 inclusive
    - Validate longitude: number between -180 and 180 inclusive
    - Validate formattedAddress: string, max 512 chars
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [x] 1.4 Write property test for location validator
    - **Property 1: Location validation accepts valid objects and rejects invalid ones**
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5**
    - Use fast-check to generate arbitrary JSON values and verify accept/reject matches spec
    - Generate valid location objects at boundary values (lat ±90, lng ±180, string lengths 1/256/512)
    - Generate invalid objects (missing fields, extra fields, out-of-range values, wrong types)

- [x] 2. Server-side card update and duplication
  - [x] 2.1 Extend card update controller to accept location field
    - Modify `server/api/controllers/cards/update.js` to add `location` to inputs with custom `isLocation` validator
    - Add `location` to `availableInputKeys` for editors
    - Support setting location to null to clear it
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 3.2_

  - [x] 2.2 Extend card duplicate helper to copy location
    - Modify `server/api/helpers/cards/duplicate-one.js` to include `location` in the `_.pick` array
    - Ensure null location is preserved as null on duplicated cards
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 2.3 Write property test for card duplication location preservation
    - **Property 7: Card duplication preserves location data**
    - **Validates: Requirements 7.1, 7.3**
    - Use fast-check to generate valid location objects and verify deep equality after duplication logic

- [x] 3. Google Maps API configuration and bootstrap
  - [x] 3.1 Extend bootstrap to include Google Maps API key and feature flag
    - Read `GOOGLE_MAPS_API_KEY` from environment variable in server config
    - Modify `server/api/helpers/bootstrap/present-one.js` to include `googleMapsApiKey` for authenticated users and `isLocationEnabled` boolean
    - Ensure empty string and unset are both treated as unconfigured
    - Ensure API key is NOT included for unauthenticated requests
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 3.2 Write unit tests for bootstrap location configuration
    - Test that `googleMapsApiKey` is included when env var is set and user is authenticated
    - Test that `googleMapsApiKey` is excluded when env var is unset or empty
    - Test that `googleMapsApiKey` is excluded for unauthenticated requests
    - Test that `isLocationEnabled` reflects configuration state
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Location search server endpoint
  - [x] 4.1 Create location search controller
    - Create `server/api/controllers/cards/location-search.js`
    - Accept `query` parameter, require authentication
    - Proxy request to Google Places API using server-side `GOOGLE_MAPS_API_KEY`
    - Return up to 5 results with `placeName`, `latitude`, `longitude`, `formattedAddress`
    - Return 404 when `GOOGLE_MAPS_API_KEY` is not configured
    - Return 502 when Google API is unreachable
    - _Requirements: 2.2, 5.1, 5.4_

  - [x] 4.2 Register location search route
    - Add route `GET /cards/:id/location-search` to server routing configuration
    - Ensure proper authentication middleware is applied
    - _Requirements: 2.2, 5.4_

  - [x] 4.3 Write property test for search result limiting
    - **Property 2: Search triggers only for inputs of 3 or more characters and returns at most 5 results**
    - **Validates: Requirements 2.2**
    - Use fast-check to generate strings of varying lengths and mock API responses of varying sizes
    - Verify the endpoint returns at most 5 items regardless of input

- [x] 5. Checkpoint - Server implementation complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Client-side Redux state and API integration
  - [x] 6.1 Extend Redux state for location feature
    - Add `googleMapsApiKey` and `isLocationEnabled` to bootstrap/config state slice
    - Ensure card entity in Redux ORM includes `location` field
    - Store bootstrap values from server response
    - _Requirements: 5.2, 5.5_

  - [x] 6.2 Create location search API function
    - Add location search API call in `client/src/api/cards.js`
    - Implement `searchLocations(cardId, query)` function calling `GET /cards/:id/location-search`
    - _Requirements: 2.2_

  - [x] 6.3 Create location search saga
    - Add saga to handle location search requests with debounce (300ms)
    - Only trigger search when input is 3+ characters
    - Clear results when input drops below 3 characters
    - Handle error responses gracefully
    - _Requirements: 2.2, 2.3, 2.6_

- [x] 7. LocationEditorStep component
  - [x] 7.1 Create LocationEditorStep popup component
    - Create `client/src/components/cards/CardModal/LocationEditorStep/` directory with component files
    - Implement as a popup step using `usePopupInClosableContext` pattern (matching AddTaskListStep/AddAttachmentStep)
    - Include title header "Location"
    - Include editable title text input (auto-filled from selection, manually editable)
    - Include search input field with 300ms debounce
    - Display up to 5 search results showing place name + formatted address in API order
    - Show "No locations found" when search returns empty results
    - Show error message when API fails, preserve input text
    - Show current location with remove button when location is assigned
    - Popup closes on outside click or when location is saved
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.4_

  - [x] 7.2 Wire LocationEditorStep into card modal sidebar
    - Add Location button to the "Add to Card" sidebar in `ProjectContent.jsx`
    - Position after Attachment button and before Custom Field button
    - Use `map marker alternate` icon
    - Conditionally render based on `isEditor` and `isLocationEnabled`
    - Register popup using `usePopupInClosableContext(LocationEditorStep)`
    - _Requirements: 5.2, 3.2_

  - [x] 7.3 Write property test for location field mapping
    - **Property 4: Selecting a location maps all fields correctly**
    - **Validates: Requirements 3.1**
    - Use fast-check to generate place result objects and verify all four fields are mapped identically

  - [x] 7.4 Write property test for search result ordering and fields
    - **Property 3: Search results preserve order and contain required fields**
    - **Validates: Requirements 2.4**
    - Use fast-check to generate arrays of results and verify output order and field presence

- [x] 8. MapPreview component
  - [x] 8.1 Create MapPreview component
    - Create `client/src/components/cards/CardModal/MapPreview/` directory with component files
    - Render section header with `map marker alternate` icon + "Location" text
    - Render Google Maps Static API image at full width, max height 200px
    - Construct URL: `https://maps.googleapis.com/maps/api/staticmap?center={lat},{lng}&zoom=15&size=600x200&markers={lat},{lng}&key={apiKey}`
    - Display place name and formatted address caption below map
    - Handle image load error: show placeholder with place name + "Map could not be loaded" message
    - Add click handler on map image to open InteractiveMapOverlay
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 8.2 Integrate MapPreview into card detail view
    - Add MapPreview section to card detail content area
    - Position after Custom Field Groups and before Comments/Activities
    - Conditionally render only when `card.location` is non-null
    - Do not render when location is null
    - _Requirements: 4.1, 4.4_

  - [x] 8.3 Write property test for map preview coordinates
    - **Property 5: Map preview receives correct coordinates**
    - **Validates: Requirements 4.1**
    - Use fast-check to generate valid lat/lng pairs and verify static map URL contains correct coordinates and zoom level 15

- [x] 9. InteractiveMapOverlay component
  - [x] 9.1 Create InteractiveMapOverlay component
    - Create `client/src/components/cards/CardModal/InteractiveMapOverlay/` directory with component files
    - Render as a modal overlay covering the card detail view
    - Load Google Maps JavaScript SDK and render interactive map
    - Center map on saved lat/lng with marker at that position
    - Set initial zoom level to 15
    - Allow pan (drag) and zoom (scroll/pinch + on-screen controls)
    - Close button in top-right corner
    - Dismiss on Escape key press
    - "Open in Google Maps" link: `https://www.google.com/maps/@{lat},{lng},15z` opening in new tab
    - Error state: show error message if SDK fails to load, keep close button functional
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

  - [x] 9.2 Write property test for interactive map overlay coordinates
    - **Property 8: Interactive map overlay centers on saved coordinates**
    - **Validates: Requirements 8.2**
    - Use fast-check to generate valid coordinates and verify map initialization props

  - [x] 9.3 Write property test for Google Maps external link URL
    - **Property 9: Google Maps external link constructs correct URL from coordinates**
    - **Validates: Requirements 8.8**
    - Use fast-check to generate valid lat/lng pairs and verify URL format `https://www.google.com/maps/@{lat},{lng},15z`

- [x] 10. LocationIndicator on card preview in board view
  - [x] 10.1 Create LocationIndicator for card preview
    - Add location indicator to `client/src/components/cards/Card/ProjectContent.jsx`
    - Display `map marker alternate` icon followed by place name text
    - Apply single-line truncation with `text-overflow: ellipsis`
    - Conditionally render only when `card.location` is non-null
    - Ensure real-time updates when location is added/removed/changed (via Redux store)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 10.2 Write property test for card preview location indicator
    - **Property 6: Card preview displays location indicator with place name**
    - **Validates: Requirements 6.1**
    - Use fast-check to generate locations with varying place names and verify rendering includes icon and text

- [x] 11. Checkpoint - Client implementation complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Integration and wiring
  - [x] 12.1 Wire server error handling for location operations
    - Ensure card update returns proper error responses for invalid location data
    - Ensure location search returns 502 for Google API failures
    - Ensure client handles error responses with toast notifications and state preservation
    - _Requirements: 1.5, 2.6, 3.6_

  - [x] 12.2 Ensure WebSocket broadcasts include location data
    - Verify that card update WebSocket broadcasts include the location field
    - Ensure other connected clients receive location updates in real-time
    - _Requirements: 6.4_

  - [x] 12.3 Write integration tests for location API endpoints
    - Test PATCH /cards/:id with valid location data
    - Test PATCH /cards/:id with invalid location data (validation errors)
    - Test PATCH /cards/:id with null location (clear)
    - Test GET /cards/:id/location-search with mocked Google API
    - Test card duplication preserves location
    - _Requirements: 1.1, 1.5, 1.6, 2.2, 7.1_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses Jest for testing and fast-check is recommended for property-based tests
- The Google Maps JavaScript SDK can be loaded via `@react-google-maps/api` package or direct script injection
- Server-side Places API proxy protects the API key from direct browser exposure

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "2.1", "2.2", "3.1"] },
    { "id": 2, "tasks": ["2.3", "3.2", "4.1", "4.2"] },
    { "id": 3, "tasks": ["4.3", "6.1"] },
    { "id": 4, "tasks": ["6.2", "6.3"] },
    { "id": 5, "tasks": ["7.1", "7.2"] },
    { "id": 6, "tasks": ["7.3", "7.4", "8.1"] },
    { "id": 7, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 8, "tasks": ["9.2", "9.3", "10.1"] },
    { "id": 9, "tasks": ["10.2", "12.1", "12.2"] },
    { "id": 10, "tasks": ["12.3"] }
  ]
}
```
