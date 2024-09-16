const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;
const flash = require("express-flash");
require("dotenv").config();
const cookieSession = require('cookie-session');
const path = require('path');
const cookieParser = require("cookie-parser"); // Importar cookie-parser
app.use(cookieParser()); // Agregar cookie-parser a la aplicación Express

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY],
  maxAge: 30 * 24 * 60 * 60 * 1000, // La sesión se guardará durante 30 días
}));

app.use((req, res, next) => {
  user_sesion = req.session.user;
  next();
});

// Configura express-flash, para enviar información temporal a usuarios después de una acción
app.use(flash());

// uso de mensajes flash
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


// Configuración de vistas EJS
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const oneDay = 24 * 60 * 60 * 1000; // Duración de la caché en milisegundos

app.use('/static', express.static(path.join(__dirname, 'statics'), {
  maxAge: oneDay
}));

// Rutas
const routes = require("./routes/routes.js");
app.use("/", routes);

// Importa la función mostrarError
const { mostrarError } = require('./controllers/seccionesController');

// Define tus rutas aquí...

// Middleware para manejar las solicitudes a rutas no definidas
app.use((req, res) => {
  mostrarError(req, res, 'Página no encontrada');
});

// Servidor
app.listen(port, () => {
  console.log(`Fight the Power en http://localhost:${port}`);
});
