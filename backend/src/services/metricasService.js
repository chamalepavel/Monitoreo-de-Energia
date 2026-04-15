const pool = require('../config/db');

const guardarMetrica = async (data) => {
  const { nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje } = data;

  const resultado = await pool.query(
    `INSERT INTO metricas_log
      (nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje]
  );

  return resultado.rows[0];
};

const obtenerMetricas = async ({ rango, criticidad, busqueda, limite = 100 }) => {
  let sql = `
    SELECT
      m.id,
      m.timestamp,
      m.nodo_id,
      n.nombre    AS nodo_nombre,
      n.ubicacion AS nodo_ubicacion,
      m.vatios_generados,
      m.voltaje,
      m.status_code,
      m.criticidad,
      m.mensaje
    FROM metricas_log m
    INNER JOIN nodos n ON m.nodo_id = n.id
    WHERE 1=1
  `;

  const valores = [];
  let p = 1;

  if (rango === 'hoy') {
    sql += ` AND m.timestamp >= CURRENT_DATE AT TIME ZONE 'America/Guatemala'`;
  } else if (rango === 'ayer') {
    sql += ` AND m.timestamp >= (CURRENT_DATE - INTERVAL '1 day') AT TIME ZONE 'America/Guatemala'
             AND m.timestamp <  CURRENT_DATE AT TIME ZONE 'America/Guatemala'`;
  } else if (rango === 'ultimo_mes') {
    sql += ` AND m.timestamp >= (NOW() - INTERVAL '30 days')`;
  }

  if (criticidad && ['info', 'warning', 'error'].includes(criticidad)) {
    sql += ` AND m.criticidad = $${p}`;
    valores.push(criticidad);
    p++;
  }

  if (busqueda && busqueda.trim() !== '') {
    sql += ` AND (
      m.nodo_id::text ILIKE $${p}
      OR n.ubicacion ILIKE $${p}
      OR n.nombre ILIKE $${p}
    )`;
    valores.push(`%${busqueda.trim()}%`);
    p++;
  }

  sql += ` ORDER BY m.timestamp DESC LIMIT $${p}`;
  valores.push(limite);

  const resultado = await pool.query(sql, valores);
  return resultado.rows;
};

const obtenerUltimos5Min = async (nodo_id) => {
  const resultado = await pool.query(
    `SELECT timestamp, vatios_generados, voltaje, criticidad
     FROM metricas_log
     WHERE nodo_id = $1
       AND timestamp >= NOW() - INTERVAL '5 minutes'
     ORDER BY timestamp ASC`,
    [nodo_id]
  );
  return resultado.rows;
};

const obtenerHistoricoBarras = async (agrupacion = 'dia') => {
  let sql;

  if (agrupacion === 'dia') {
    sql = `
      SELECT
        TO_CHAR(timestamp AT TIME ZONE 'America/Guatemala', 'YYYY-MM-DD') AS periodo,
        ROUND(SUM(vatios_generados)::numeric, 2) AS total_vatios
      FROM metricas_log
      WHERE timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY periodo
      ORDER BY periodo ASC
    `;
  } else {
    sql = `
      SELECT
        TO_CHAR(timestamp AT TIME ZONE 'America/Guatemala', 'YYYY-MM') AS periodo,
        ROUND(SUM(vatios_generados)::numeric, 2) AS total_vatios
      FROM metricas_log
      WHERE timestamp >= NOW() - INTERVAL '12 months'
      GROUP BY periodo
      ORDER BY periodo ASC
    `;
  }

  const resultado = await pool.query(sql);
  return resultado.rows;
};

const obtenerEstadoNodos = async () => {
  const resultado = await pool.query(`
    WITH ultima_metrica AS (
      SELECT DISTINCT ON (nodo_id)
        nodo_id,
        criticidad,
        timestamp
      FROM metricas_log
      ORDER BY nodo_id, timestamp DESC
    ),
    estado_nodos AS (
      SELECT
        n.id,
        n.nombre,
        CASE
          WHEN um.nodo_id IS NULL OR um.timestamp < NOW() - INTERVAL '10 minutes'
            THEN 'Offline'
          WHEN um.criticidad = 'error'   THEN 'Error'
          WHEN um.criticidad = 'warning' THEN 'Alerta'
          ELSE 'Online'
        END AS estado
      FROM nodos n
      LEFT JOIN ultima_metrica um ON n.id = um.nodo_id
    )
    SELECT estado, COUNT(*) AS cantidad
    FROM estado_nodos
    GROUP BY estado
    ORDER BY estado
  `);

  return resultado.rows;
};

module.exports = {
  guardarMetrica,
  obtenerMetricas,
  obtenerUltimos5Min,
  obtenerHistoricoBarras,
  obtenerEstadoNodos,
};
