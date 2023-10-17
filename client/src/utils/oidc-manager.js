import { UserManager } from 'oidc-client-ts';

export default class OidcManager {
  constructor(config) {
    this.userManager = new UserManager({
      ...config,
      authority: config.issuer,
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes,
    });
  }

  login() {
    return this.userManager.signinRedirect();
  }

  loginCallback() {
    return this.userManager.signinRedirectCallback();
  }

  logout() {
    return this.userManager.signoutSilent();
  }
}

export const createOidcManager = (config) => new OidcManager(config);
