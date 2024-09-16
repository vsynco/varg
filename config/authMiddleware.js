function Authenticated(req, res, next) {
  if (req.session && req.session.user) {
    // Si el usuario está autenticado, continúa con la solicitud
    return next();
  }
  req.session.redirectTo = req.originalUrl;
  res.redirect("/invitacion");
}

async function Admin(req, res, next) {
  const user = req.session.user.administrador;
  if (user === true) {
    // Si el usuario está autenticado y es un administrador, continúa con la solicitud
    return next();
  }
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