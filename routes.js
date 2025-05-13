

// Desarrollo
const express = require("express");
const router = express.Router();
const is = require("./config/authMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

const accesosController = require("./controllers/accesosController");

router.use((req, res, next) => { 
  req.userSession = req.session.user; 
  next(); 
});

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
const apiController = require("./controllers/apiController");
// ACCESO
router.get("/", seccionesController.mostrarPortada);
router.get("/contacto", seccionesController.mostrarContacto);
router.get("/worker", seccionesController.mostrarWorker);
router.get("/aguas", seccionesController.mostrarAguas);
router.get("/blog", seccionesController.mostrarBlog);
router.get("/map", seccionesController.mostrarMap);
router.post("/api/abo", apiController.recibirProspecto);


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

router.post("/registro", personasController.registrarPersona);

// Perfil

router.get("/perfil", is.Authenticated, (req, res) => {
  const pageTitle = "Perfil";
  personasController.mostrarPerfil(req, res, pageTitle);
});

// Cerrar Sesión

router.get("/salir", personasController.cerrarSesion);



module.exports = router;