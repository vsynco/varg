const express = require("express");
const router = express.Router();

// Autenticación
const is = require("../config/authMiddleware");

const personasController  = require("../controllers/personasController");
const proyectosController  = require("../controllers/proyectosController");
const seccionesController = require("../controllers/seccionesController");
const sociosController = require("../controllers/sociosController");
const uploadController = require("../controllers/uploadController");
const { waitUntilObjectExists } = require("@aws-sdk/client-s3");
// Desarrollo

router.use((req, res, next) => {
  user_sesion = req.session.user;
  next();
});waitUntilObjectExists

// Desarrollo. Error Routes

router.get("/error", is.Authenticated, (req, res, next) => {
  const pageTitle = "Error";
  seccionesController.mostrarError(req, res, pageTitle);
});


// ACCESO
router.get("/", seccionesController.mostrarPortada);
router.get("/contacto", seccionesController.mostrarContacto);
router.get("/blog", seccionesController.mostrarBlog);
router.get("/only", seccionesController.mostrarOnly);

// PROYECTOS

// router.get("/jaskier", proyectosController.mostrarJaskier);
// router.get("/synco", proyectosController.mostrarSynco);
// router.get("/armis", proyectosController.mostrarArmis);
// router.get("/auda", proyectosController.mostrarAuda);
// router.get("/buzo", proyectosController.mostrarBuzo);
// router.get("/puig", proyectosController.mostrarPuig);
// router.get("/clubon", proyectosController.mostrarClubon);

// Rutas GET
router.get('/proyectos/nuevo', proyectosController.mostrarFormularioNuevoProyecto);
router.get('/proyectos', proyectosController.listarProyectos);
router.get('/proyectos/:id', proyectosController.mostrarProyecto);

// Rutas POST, PUT, DELETE (asumiendo que tienes autenticación/autorización implementada)
router.post('/proyectos/', proyectosController.crearProyecto);
router.put('/proyectos/:id', proyectosController.actualizarProyecto);



// SOCIOS
router.post('/socios', sociosController.anadirSocio);
router.put('/socios/editar/:id', sociosController.editarSocio);
router.delete('/socios/eliminar/:id', sociosController.eliminarSocio);

// UPLOAD

router.get('/upload', uploadController.mostrarFormularioSubida);
router.post('/upload', uploadController.subirArchivo);




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

router.post("/acceso", personasController.iniciarSesion);

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