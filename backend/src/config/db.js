require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Conexion a PostgreSQL establecida');
});

pool.on('error', (err) => {
  console.error('Error en el pool de PostgreSQL:', err.message);
  process.exit(-1);
});

module.exports = pool;
