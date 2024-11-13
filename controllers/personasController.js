const personas = require("../models/personas");
const https = require("https");
const bcrypt = require("bcrypt");

async function mostrarFormularioDeAcceso(req, res, pageTitle) {
    res.render("acceso/acceso_login", {
      title: pageTitle,
      message: req.flash("error"),
    });
  }
  
  async function mostrarPerfil(req, res, pageTitle) {
    try {
      const usuario = await personas.obtenerPersonaId(req.session.user.id);
      console.log(usuario)
      res.render("acceso/acceso_perfil", {
        title: pageTitle,
        usuario,
      });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).send("Error al obtener usuario.");
    }
  }
  
  function cerrarSesion(req, res) {
    req.session = null;
    res.redirect('/');
  }
  
async function iniciarSesion(req, res) {
  console.log('[DEBUG] Iniciando función de inicio de sesión');
  const { email, contrasena } = req.body;
  console.log(`[DEBUG] Intento de inicio de sesión para email: ${email}`);

  try {
    const usuario = await personas.obtenerPersonaEmail(email);
    console.log('[DEBUG] Resultado de búsqueda de usuario:', usuario ? 'Usuario encontrado' : 'Usuario no encontrado');

    if (!usuario) {
      console.log('[DEBUG] Usuario no encontrado, redirigiendo a /acceso');
      req.flash('error_msg', 'El correo electrónico es incorrecto');
      return res.redirect('/acceso');
    }

    const match = await bcrypt.compare(contrasena, usuario.contrasena);
    console.log('[DEBUG] Resultado de comparación de contraseña:', match ? 'Coincide' : 'No coincide');

    if (!match) {
      console.log('[DEBUG] Contraseña incorrecta, redirigiendo a /acceso');
      req.flash('error_msg', 'La contraseña es incorrecta');
      return res.redirect('/acceso');
    }

    console.log('[DEBUG] Inicio de sesión exitoso, estableciendo sesión de usuario');
    req.session.user = usuario;
    console.log('[DEBUG] Sesión de usuario establecida:', req.session.user);

    const redirectTo = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    console.log(`[DEBUG] Redirigiendo a: ${redirectTo}`);
    res.redirect(redirectTo);
  } catch (error) {
    console.error('[ERROR] Error durante el inicio de sesión:', error);
    req.flash('error_msg', 'Ocurrió un error durante el inicio de sesión');
    res.redirect('/acceso');
  }
}

  async function registrarPersona(req, res) {
    let { nombre, email, contrasena, telefono } = req.body;

    // Convertir email a minúsculas
    email = email.toLowerCase();

    // Convertir cada palabra del nombre a título (primera letra en mayúscula)
    nombre = nombre.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    // Verificar si el email ya está registrado
    const usuario = await personas.obtenerPersonaEmail(email);
    if (usuario) {
        return res.status(409).send({ message: "El correo electrónico ya está registrado." });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar nueva persona
    const userId = await personas.insertarPersona({ nombre, email, contrasena: hashedPassword, telefono });

    // Crear sesión del usuario
    req.session.user = { id: userId };
    res.redirect('/');
}


module.exports = {
    mostrarPerfil,
    mostrarFormularioDeAcceso,
    mostrarPerfil,
    cerrarSesion,
    iniciarSesion,
    registrarPersona,
  };