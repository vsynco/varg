require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const flash = require("express-flash");
const cron = require('node-cron');
const cookieSession = require('cookie-session');
const path = require('path');
const crypto = require('crypto');
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));


// Configuración de middlewares básicos
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de sesiones mejorada
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY],
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: false, // o verifica si estás usando HTTPS
  sameSite: 'lax'  // cambia a 'lax' si tienes problemas con redirecciones
}));

// Middleware para generar ID de sesión si no existe
app.use((req, res, next) => {
  if (!req.session.id) {
    req.session.id = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Middleware para manejar la sesión del usuario
app.use((req, res, next) => {
  // Guarda el usuario en res.locals para acceso en las vistas
  res.locals.currentUser = req.session?.user || null;
  next();
});

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  if (!req.session?.user?.id) {
    req.flash('error_msg', 'Debes iniciar sesión para acceder');
    return res.redirect('/login');
  }
  next();
};

// Configura express-flash
app.use(flash());

// Middleware para mensajes flash
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Configuración de vistas y estáticos
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const oneDay = 24 * 60 * 60 * 1000;
app.use('/static', express.static(path.join(__dirname, 'statics'), {
  maxAge: oneDay
}));

app.use('/archivos', express.static('/var/data'));

// Tarea CRON
cron.schedule('0 9 * * 2,4', () => {
  console.log('Ejecutando tarea programada los martes y jueves a las 9 AM');
  // realizarTareaEspecifica();
});

// Rutas
const routes = require("./routes.js");
app.use("/", routes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: 'Algo salió mal!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).render('error', { message: 'Página no encontrada' });
});

// Servidor
app.listen(port, () => {
  console.log(`Be the Power http://localhost:${port}`);
});