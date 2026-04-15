const pool = require('../config/db');

const obtenerTodosLosNodos = async () => {
  const resultado = await pool.query(
    `SELECT id, nombre, ubicacion, version_fw, created_at
     FROM nodos
     ORDER BY nombre ASC`
  );
  return resultado.rows;
};

const obtenerNodoPorId = async (id) => {
  const resultado = await pool.query(
    `SELECT id, nombre, ubicacion, version_fw, created_at
     FROM nodos
     WHERE id = $1`,
    [id]
  );
  // devuelve null si no existe, el controller se encarga del 404
  return resultado.rows[0] || null;
};

module.exports = {
  obtenerTodosLosNodos,
  obtenerNodoPorId,
};
