const port = process.env.PORT || 3000;

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.BBDD_USER,
  host: process.env.BBDD_HOSTNAME,
  database: process.env.BBDD_DATABASE,
  password: process.env.BBDD_PASSWORD,
  port: process.env.BBDD_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
