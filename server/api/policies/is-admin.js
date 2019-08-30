module.exports = async function isAuthenticated(req, res, proceed) {
  if (!req.currentUser.isAdmin) {
    return res.notFound(); // Forbidden
  }

  return proceed();
};
