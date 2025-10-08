function verifyAdminLogin(req, res, next) {
  if (req.session && req.session.isAdminLoggedIn) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

module.exports = verifyAdminLogin;
