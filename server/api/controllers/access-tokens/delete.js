module.exports = {
  async fn() {
    const { accessToken, currentUser } = this.req;

    const session = await Session.updateOne({
      accessToken,
      deletedAt: null,
    }).set({
      deletedAt: new Date().toUTCString(),
    });

    const result = {
      item: accessToken,
    };

    if (currentUser.ssoId) {
      try {
        const { sp, idp } = await sails.helpers.saml.getConfig(currentUser.ssoId);

        const ssoUrl = await new Promise((resolve, reject) => {
          sp.create_logout_request_url(idp, { session_index: session.sso_id }, (err, url) => {
            if (err) {
              reject();
            } else {
              resolve(url);
            }
          });
        });

        Object.assign(result, { ssoUrl });
      } catch (e) {
        // not saml or bad config
      }
    }

    return result;
  },
};
