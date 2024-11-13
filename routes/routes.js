const express = require("express");
const router = express.Router();

// Autenticación
const is = require("../config/authMiddleware");
const personasController  = require("../controllers/personasController");
const seccionesController = require("../controllers/seccionesController");
// Desarrollo

router.use((req, res, next) => {
  user_sesion = req.session.user;
  next();
});

// Desarrollo. Error Routes

router.get("/error", is.Authenticated, (req, res, next) => {
  const pageTitle = "Error";
  seccionesController.mostrarError(req, res, pageTitle);
});


// ACCESO
router.get("/", seccionesController.mostrarPortada);
router.get("/contacto", seccionesController.mostrarContacto);
router.get("/blog", seccionesController.mostrarBlog);




router.get("/acceso", async (req, res, next) => {
  if (user_sesion) {
    const pageTitle = "Portada";
    seccionesController.mostrarPortada(req, res, pageTitle);
  } else {
    const pageTitle = "Acceso";
    const userData = req.cookies.userData;
    personasController.mostrarFormularioDeAcceso(req, res, pageTitle, userData);
  }
}
);

// ACCESO
router.post("/acceso", (req, res, next) => {
  personasController.iniciarSesion(req, res, next);
});
// REGISTRO

router.get("/registro", async (req, res, next) => {
  if (user_sesion) {
    const pageTitle = "Portada";
    seccionesController.mostrarPortada(req, res, pageTitle);
  } else {
    const pageTitle = "Registro";
    const userData = req.cookies.userData;
    personasController.mostrarFormularioDeRegistro(req, res, pageTitle, userData);
  }
});

router.post("/registro", personasController.registrarPersona);

// Perfil

router.get("/perfil", is.Authenticated, (req, res) => {
  const pageTitle = "Perfil";
  personasController.mostrarPerfil(req, res, pageTitle);
});

// Cerrar Sesión

router.get("/salir", personasController.cerrarSesion);


module.exports = router;