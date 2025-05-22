function Authenticated(req, res, next) {
  try {
    if (req.session && req.session.user) {
      return next();
    }
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
}

function Admin(req, res, next) {
  try {
    // Verificar sesión y usuario
    if (!req.session || !req.session.user) {
      console.log('No hay sesión o usuario');
      return res.redirect("/");
    }

    // Comparar con 1 o simplemente usar el valor numérico
    if (req.session.user.administrador === 1) {
      return next();
    }
    // O simplemente
    if (req.session.user.administrador) {
      return next();
    }

    res.redirect("/");
  } catch (error) {
    console.error('Error en middleware Admin:', error);
    res.redirect("/");
  }
}

module.exports = {
  Authenticated,
  Admin,
};