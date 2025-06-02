

// Desarrollo
const express = require("express");
const router = express.Router();
const is = require("./config/authMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.use((req, res, next) => { 
  req.userSession = req.session.user; 
  next(); 
});

const accesosController = require("./controllers/accesosController");

router.use((req, res, next) => {
  const host = req.headers.host;

  if (host === 'puigabogados.cl' || host === 'www.puigabogados.cl') {
    if (req.path === '/' || req.path === '') {
      // Reescribe la ruta para servir el contenido de /puig
      req.url = '/puig';
    }
  }

  next();
});

// Autenticación
const personasController  = require("./controllers/personasController");
const seccionesController = require("./controllers/seccionesController");

// ACCESO
router.get("/", seccionesController.mostrarPortada);
router.get("/worker", seccionesController.mostrarWorker);

router.get("/acceso", (req, res) => {
  if (req.userSession) {
    const pageTitle = "Portada";
    seccionesController.mostrarPortada(req, res, pageTitle);
  } else {
    const pageTitle = "Acceso";
    personasController.mostrarFormularioDeAcceso(req, res, pageTitle);
  }
});

// ACCESO
router.post("/acceso", (req, res, next) => {
  personasController.iniciarSesion(req, res, next);
});

// Perfil
router.get("/perfil", is.Authenticated, (req, res) => {
  const pageTitle = "Perfil";
  personasController.mostrarPerfil(req, res, pageTitle);
});

// Cerrar Sesión

router.get("/salir", personasController.cerrarSesion);

router.get("/puig", async (req, res, next) => {
  const pageTitle = "Puig Legal Group";
  accesosController.mostrarPuig(req, res, pageTitle);
});

module.exports = router;