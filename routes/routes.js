const express = require("express");
const router = express.Router();

// Autenticación
const is = require("../config/authMiddleware");

const personasController  = require("../controllers/personasController");
const proyectosController  = require("../controllers/proyectosController");
const seccionesController = require("../controllers/seccionesController");
const enlacesController = require("../controllers/enlacesController");
const sociosController = require("../controllers/sociosController");
const rondasController = require("../controllers/rondasController");

const uploadController = require("../controllers/uploadController");
const cuentasBancariasController = require("../controllers/cuentasBancariasController");
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
router.get("/only", is.Admin, seccionesController.mostrarOnly);



// PROYECTOS

// router.get("/jaskier", proyectosController.mostrarJaskier);
// router.get("/synco", proyectosController.mostrarSynco);
// router.get("/armis", proyectosController.mostrarArmis);
// router.get("/auda", proyectosController.mostrarAuda);
// router.get("/buzo", proyectosController.mostrarBuzo);
// router.get("/puig", proyectosController.mostrarPuig);
// router.get("/clubon", proyectosController.mostrarClubon);

router.post('/enlaces', enlacesController.crearEnlace);
router.put('/enlaces/:id', enlacesController.actualizarEnlace);
router.delete('/enlaces/:id', enlacesController.eliminarEnlace);



// Rutas GET
router.get('/proyectos/nuevo', is.Admin, proyectosController.mostrarFormularioNuevoProyecto);
router.get('/proyectos', is.Admin, proyectosController.listarProyectos);
router.get('/proyectos/:id', proyectosController.mostrarProyecto);
router.get('/proyectos/editar/:id', is.Admin, proyectosController.editarProyecto);

// Rutas POST, PUT, DELETE (asumiendo que tienes autenticación/autorización implementada)
router.post('/proyectos/editar/:id', is.Admin, proyectosController.actualizarProyecto);
router.post('/proyectos/', is.Admin, proyectosController.crearProyecto);


router.post('/proyectos/foto', is.Admin, uploadController.subirProyectoFoto);

// SOCIOS
router.post('/socios', is.Admin, sociosController.anadirSocio);
router.put('/socios/editar/:id', is.Admin, sociosController.editarSocio);
router.delete('/socios/eliminar/:id', is.Admin, sociosController.eliminarSocio);

// UPLOAD

router.get('/upload', is.Admin, uploadController.mostrarFormularioSubida);
router.post('/upload', is.Admin, uploadController.subirArchivoGeneral);
router.post('/eliminar', is.Admin, uploadController.eliminarArchivo);


// Crear una nueva cuenta bancaria
router.post('/cuentas-bancarias', is.Admin, cuentasBancariasController.crearCuentaBancaria);

// Actualizar una cuenta bancaria existente
router.put('/cuentas-bancarias/editar/:id', is.Admin, cuentasBancariasController.actualizarCuentaBancaria);

// Eliminar una cuenta bancaria
router.delete('/cuentas-bancarias/eliminar/:id', is.Admin, cuentasBancariasController.eliminarCuentaBancaria);


// RONDAS DE INVERSIÓN
router.get('/proyectos/:proyectoId/rondas', rondasController.listarRondas);
router.post('/rondas/:rondaId/invertir', rondasController.realizarInversion);
router.get('/rondas/:rondaId/inversiones', rondasController.listarInversiones);
router.put('/inversiones/:inversionId', rondasController.actualizarEstadoInversion);


router.get('/rondas', rondasController.mostrarRondas);
router.get('/rondas/crear', is.Admin, rondasController.crearRondaForm);
router.post('/rondas/crear', is.Admin, rondasController.crearRonda);
router.get('/rondas/:rondaId', rondasController.mostrarRonda);
router.get('/rondas/:rondaId/comprar-tramo/:tramoId', rondasController.mostrarFormularioCompraTramo);
router.post('/rondas/:rondaId/comprar-tramo/:tramoId', rondasController.comprarTramo);



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