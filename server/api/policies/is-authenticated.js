module.exports = async function isAuthenticated(req, res, proceed) {
  if (!req.currentUser) {
    return res.unauthorized('Access token is missing, invalid or expired');
  }

  return proceed();
};
