const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.BBDD_HOSTNAME,
  user: process.env.BBDD_USER,
  password: process.env.BBDD_PASSWORD,
  database: process.env.BBDD_DATABASE,
  connectionLimit: 10
});

// Verificar la conexión
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release(); // Liberar la conexión de vuelta al pool
  } catch (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    } else {
      console.error('Database connection error:', err.message);
    }
  }
};

// Ejecutar la verificación de conexión al iniciar
checkConnection();

module.exports = pool;
