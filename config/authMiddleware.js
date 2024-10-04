function Authenticated(req, res, next) {
  if (req.session && req.session.user) {
    // Si el usuario está autenticado, continúa con la solicitud
    return next();
  }
  req.session.redirectTo = req.originalUrl;
  res.redirect("/invitacion");
}

async function Admin(req, res, next) {
  const user = req.session.user;
  if (user && user.administrador === 1) {
    // Si el usuario está autenticado y es un administrador, continúa con la solicitud
    return next();
  }
  // Si no es administrador o no está autenticado, redirige a la página principal
  res.redirect("/");
}

async function Afiliado(req, res, next) {
  const user = req.session.user.es_afiliado;
  if (user === true) {
    // Si el usuario está autenticado y es un administrador, continúa con la solicitud
    return next();
  }
  res.redirect("/");
}

module.exports = {
  Authenticated,
  Admin,
  Afiliado,
};