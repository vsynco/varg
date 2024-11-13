// config/turso.js
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.LIBSQL,
  authToken: process.env.LIBSQL_TOKEN,
  intMode: "number",  // Añadimos esta configuración
  transformRow: row => row, // Y esta también
});

module.exports = db;