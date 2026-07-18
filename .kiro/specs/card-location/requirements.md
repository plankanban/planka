# Requirements Document

## Introduction

This feature adds location support to cards in Planka. Users can search for a location using Google Maps, attach it to a card, and see a small map preview displayed on the card. This enables teams to associate geographic context with their tasks, useful for event planning, field work coordination, and location-based project management.

## Glossary

- **Card**: A work item within a list on a Planka board, containing a name, description, and optional metadata such as due dates, labels, and attachments.
- **Location_Field**: A data structure stored on a Card that holds a place name, latitude, longitude, and an optional formatted address.
- **Location_Search**: A UI component that queries the Google Maps Places API to find locations matching user input.
- **Map_Preview**: A static or embedded map image displayed on the card detail view showing the saved location with a marker.
- **Interactive_Map_Overlay**: A modal overlay displayed within the application window containing a full-size interactive Google Map, allowing pan and zoom interactions without navigating away from the card detail view.
- **Google_Maps_API**: The external Google Maps service used for place search (Places API) and map rendering (Static Maps API or Maps Embed API).
- **Server**: The Planka backend application built on Sails.js with PostgreSQL.
- **Client**: The Planka frontend React application.

## Requirements

### Requirement 1: Store Location Data on Cards

**User Story:** As a user, I want cards to store location information, so that geographic context is persisted with my tasks.

#### Acceptance Criteria

1. THE Server SHALL store a location field on each Card as a JSON object containing placeName (string, maximum 256 characters), latitude (number), longitude (number), and formattedAddress (string, maximum 512 characters), where all four properties are required when the location object is non-null.
2. THE Server SHALL allow the location field to be null when no location is assigned to a Card.
3. WHEN a Card is created or updated with a location value, THE Server SHALL validate that latitude is between -90 and 90 and longitude is between -180 and 180.
4. WHEN a Card is created or updated with a location value, THE Server SHALL validate that placeName is a non-empty string with a maximum length of 256 characters.
5. IF a location value is provided that is missing any required property or contains an invalid value, THEN THE Server SHALL reject the request with a validation error and not persist the Card changes.
6. WHEN a Card is updated with a location value of null, THE Server SHALL clear the previously stored location data for that Card.

### Requirement 2: Search for Locations

**User Story:** As a user, I want to search for locations using Google Maps when editing a card, so that I can find and attach a real-world place.

#### Acceptance Criteria

1. WHEN a user opens the location editor on a Card, THE Client SHALL display a text input field for searching locations.
2. WHEN a user types at least 3 characters into the Location_Search input, THE Client SHALL query the Google Maps Places API and display up to 5 matching results within 1 second of the last keystroke (debounced).
3. WHEN the Location_Search input value is reduced to fewer than 3 characters, THE Client SHALL clear the displayed search results.
4. WHILE search results are displayed, THE Client SHALL display each result with its place name and formatted address, in the order returned by the Google_Maps_API.
5. WHEN no results are found for a search query, THE Client SHALL display a message indicating no locations were found.
6. IF the Google_Maps_API returns an error or is unreachable, THEN THE Client SHALL display an error message to the user, preserve the current search input text, and allow the user to retry by modifying the query.

### Requirement 3: Assign a Location to a Card

**User Story:** As a user, I want to select a location from the search results and save it to my card, so that the card is associated with a specific place.

#### Acceptance Criteria

1. WHEN a user selects a location from the search results, THE Client SHALL populate the Location_Field with the selected place's name, latitude, longitude, and formatted address.
2. WHEN a user selects a location, THE Client SHALL send an update request to the Server to persist the location on the Card.
3. WHEN the Server successfully saves the location, THE Client SHALL display the place name and formatted address on the card detail view.
4. WHEN a user activates the remove action on an assigned location, THE Client SHALL send an update request to the Server with a null location value.
5. WHEN the Server successfully removes the location, THE Client SHALL remove the location display from the card detail view.
6. IF the Server returns an error when saving or removing a location, THEN THE Client SHALL display an error message indicating the operation failed and SHALL preserve the previous location state on the card detail view.

### Requirement 4: Display Map Preview

**User Story:** As a user, I want to see a small map on the card showing the saved location, so that I can visually identify where the location is.

#### Acceptance Criteria

1. WHILE a Card has a location assigned, THE Client SHALL display a Map_Preview on the card detail view showing a marker at the saved latitude and longitude at a zoom level of 15 (street-level context).
2. THE Map_Preview SHALL render at a fixed height of no more than 200 pixels and full available width of the card detail layout, without requiring scrolling to see other card fields.
3. WHEN the Map_Preview is clicked, THE Client SHALL open the Interactive_Map_Overlay centered on the saved latitude and longitude coordinates.
4. WHILE a Card has no location assigned, THE Client SHALL not display any Map_Preview on the card detail view.
5. IF the Map_Preview fails to load due to a network error or Google_Maps_API unavailability, THEN THE Client SHALL display a placeholder with the place name and a message indicating that the map could not be loaded.

### Requirement 5: Google Maps API Configuration

**User Story:** As an administrator, I want to configure the Google Maps API key for the Planka instance, so that location search and map display features function correctly.

#### Acceptance Criteria

1. THE Server SHALL read the Google Maps API key from an environment variable named GOOGLE_MAPS_API_KEY, treating both an unset variable and an empty string value as unconfigured.
2. WHILE the GOOGLE_MAPS_API_KEY environment variable is unconfigured, THE Server SHALL indicate in the bootstrap response that the location feature is not available, and THE Client SHALL hide the location field from the card editor.
3. WHILE the GOOGLE_MAPS_API_KEY environment variable is configured, THE Server SHALL include the Google Maps API key in the bootstrap response only for authenticated users.
4. THE Server SHALL NOT include the Google Maps API key in any API response returned to unauthenticated requests.
5. WHEN an authenticated user receives the bootstrap response containing the Google Maps API key, THE Client SHALL use the key to make Places API and map rendering requests.

### Requirement 6: Location Display on Card Preview

**User Story:** As a user, I want to see a location indicator on the card in the board view, so that I can quickly identify which cards have locations without opening them.

#### Acceptance Criteria

1. WHILE a Card has a location assigned, THE Client SHALL display a location icon followed by the place name text on the card preview in the board list view.
2. WHILE a Card has a location assigned, THE Client SHALL truncate the place name on the card preview to a single line using an ellipsis when the text exceeds the maximum available width of the card content area.
3. WHILE a Card has no location assigned, THE Client SHALL not display any location icon or place name text on the card preview.
4. WHEN a Card's location is added, removed, or changed, THE Client SHALL update the location indicator on the card preview without requiring a page reload.

### Requirement 7: Location Data in Card Duplication

**User Story:** As a user, I want location data to be preserved when I duplicate a card, so that I do not have to re-enter location information.

#### Acceptance Criteria

1. WHEN a user duplicates a Card that has a location assigned, THE Server SHALL copy the location data to the new Card such that all location field values on the duplicated Card are identical to those on the original Card.
2. WHEN a user duplicates a Card that has no location assigned, THE Server SHALL set the location field to null on the new Card.
3. WHEN a user duplicates a Card that has a location assigned to a different Board, THE Server SHALL copy the location data to the new Card regardless of the target Board.

### Requirement 8: Interactive Map Overlay

**User Story:** As a user, I want to click the map preview and see a large interactive map in the same window, so that I can explore the location in detail without leaving the application.

#### Acceptance Criteria

1. WHEN the user clicks the Map_Preview on a card detail view, THE Client SHALL display an Interactive_Map_Overlay as a modal covering the card detail view, containing an interactive Google Map rendered using the Google_Maps_API JavaScript SDK.
2. WHEN the Interactive_Map_Overlay opens, THE Client SHALL center the map on the saved latitude and longitude coordinates and display a marker at that position.
3. WHEN the Interactive_Map_Overlay opens, THE Client SHALL set the initial zoom level to 15 (street-level context), matching the Map_Preview zoom level.
4. WHILE the Interactive_Map_Overlay is displayed, THE Client SHALL allow the user to pan the map by dragging and zoom in or out using scroll or pinch gestures and on-screen zoom controls.
5. WHILE the Interactive_Map_Overlay is displayed, THE Client SHALL display a close button in the top-right corner of the overlay.
6. WHEN the user activates the close button on the Interactive_Map_Overlay, THE Client SHALL dismiss the overlay and return to the card detail view.
7. WHEN the user presses the Escape key while the Interactive_Map_Overlay is displayed, THE Client SHALL dismiss the overlay and return to the card detail view.
8. WHILE the Interactive_Map_Overlay is displayed, THE Client SHALL display a link labeled "Open in Google Maps" that, when activated, opens Google Maps in a new browser tab at the saved latitude and longitude coordinates.
9. IF the interactive map within the Interactive_Map_Overlay fails to load due to a network error or Google_Maps_API unavailability, THEN THE Client SHALL display an error message within the overlay indicating that the map could not be loaded, and SHALL still display the close button.
