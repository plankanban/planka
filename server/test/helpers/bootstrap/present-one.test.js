/*!
 * Unit tests for bootstrap present-one helper — location configuration
 * Feature: card-location
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');

// Set up lodash global as Sails.js expects
global._ = require('lodash');

// Mock User model global used in the helper
global.User = {
  Roles: {
    ADMIN: 'admin',
  },
};

const helper = require('../../../api/helpers/bootstrap/present-one');

/**
 * Helper to invoke the sync Sails helper fn with given inputs.
 */
function callHelper(inputs) {
  return helper.fn(inputs);
}

/**
 * Sets up the global `sails` mock with given googleMapsApiKey value.
 */
function setupSailsMock(googleMapsApiKey) {
  global.sails = {
    config: {
      custom: {
        googleMapsApiKey,
        version: '1.0.0',
        customerPanelUrl: 'https://example.com/panel',
        demoMode: false,
      },
    },
    hooks: {
      terms: {
        getLanguages: () => ['en', 'de'],
      },
    },
  };
}

describe('helpers/bootstrap/present-one', () => {
  describe('Google Maps API key and location feature flag', () => {
    afterEach(() => {
      delete global.sails;
    });

    it('should include googleMapsApiKey when env var is set and user is authenticated', () => {
      setupSailsMock('test-api-key-123');

      const result = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: { id: 1, role: 'member' },
      });

      expect(result.googleMapsApiKey).to.equal('test-api-key-123');
      expect(result.isLocationEnabled).to.be.true;
    });

    it('should exclude googleMapsApiKey when env var is undefined', () => {
      setupSailsMock(undefined);

      const result = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: { id: 1, role: 'member' },
      });

      expect(result).to.not.have.property('googleMapsApiKey');
      expect(result.isLocationEnabled).to.be.false;
    });

    it('should exclude googleMapsApiKey when env var is null', () => {
      setupSailsMock(null);

      const result = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: { id: 1, role: 'member' },
      });

      expect(result).to.not.have.property('googleMapsApiKey');
      expect(result.isLocationEnabled).to.be.false;
    });

    it('should exclude googleMapsApiKey when env var is empty string', () => {
      setupSailsMock('');

      const result = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: { id: 1, role: 'member' },
      });

      expect(result).to.not.have.property('googleMapsApiKey');
      expect(result.isLocationEnabled).to.be.false;
    });

    it('should exclude googleMapsApiKey for unauthenticated requests (user is null)', () => {
      setupSailsMock('test-api-key-123');

      const result = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: null,
      });

      expect(result).to.not.have.property('googleMapsApiKey');
      expect(result.isLocationEnabled).to.be.true;
    });

    it('should exclude googleMapsApiKey for unauthenticated requests (user is undefined)', () => {
      setupSailsMock('test-api-key-123');

      const result = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: undefined,
      });

      expect(result).to.not.have.property('googleMapsApiKey');
      expect(result.isLocationEnabled).to.be.true;
    });

    it('should set isLocationEnabled to true when API key is configured', () => {
      setupSailsMock('any-non-empty-key');

      const result = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: null,
      });

      expect(result.isLocationEnabled).to.be.true;
    });

    it('should set isLocationEnabled to false when API key is not configured', () => {
      setupSailsMock('');

      const result = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: null,
      });

      expect(result.isLocationEnabled).to.be.false;
    });

    it('should always include isLocationEnabled in the response regardless of auth state', () => {
      setupSailsMock('test-key');

      // Authenticated user
      const authResult = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: { id: 1, role: 'member' },
      });
      expect(authResult).to.have.property('isLocationEnabled');

      // Unauthenticated user
      const unauthResult = callHelper({
        internalConfig: { activeUsersLimit: 100 },
        oidc: null,
        user: null,
      });
      expect(unauthResult).to.have.property('isLocationEnabled');
    });

    it('should include googleMapsApiKey for admin users when configured', () => {
      setupSailsMock('admin-test-key');

      const result = callHelper({
        internalConfig: { activeUsersLimit: 50 },
        oidc: null,
        user: { id: 1, role: 'admin' },
      });

      expect(result.googleMapsApiKey).to.equal('admin-test-key');
      expect(result.isLocationEnabled).to.be.true;
    });
  });
});
