const http = require('http');
const { Pool } = require('pg');

const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '4000', 10);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'monitoreo_solar',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

const aleatorio = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const determinarCriticidad = (vatios, voltaje) => {
  if (voltaje < 180 || vatios < 500) {
    return {
      criticidad: 'error',
      status_code: 500,
      mensaje: `Falla critica: voltaje=${voltaje}V, vatios=${vatios}W`,
    };
  }
  if (voltaje < 200 || vatios < 1500) {
    return {
      criticidad: 'warning',
      status_code: 400,
      mensaje: `Baja eficiencia: voltaje=${voltaje}V, vatios=${vatios}W`,
    };
  }
  return {
    criticidad: 'info',
    status_code: 200,
    mensaje: `Operacion normal: generando ${vatios}W a ${voltaje}V`,
  };
};

const obtenerNodos = async () => {
  const resultado = await pool.query('SELECT id FROM nodos');
  return resultado.rows.map((r) => r.id);
};

const generarMetrica = (nodosIds) => {
  const nodo_id = nodosIds[Math.floor(Math.random() * nodosIds.length)];
  const esError = Math.random() < 0.1;

  const vatios_generados = esError ? aleatorio(200, 1500) : aleatorio(2000, 5000);
  const voltaje = esError ? aleatorio(160, 200) : aleatorio(210, 240);

  const { criticidad, status_code, mensaje } = determinarCriticidad(vatios_generados, voltaje);

  return { nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje };
};

const enviarMetrica = (nodosIds) => {
  const datos = generarMetrica(nodosIds);
  const cuerpo = JSON.stringify(datos);

  const opciones = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: '/api/metricas',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(cuerpo),
    },
  };

  const req = http.request(opciones, (respuesta) => {
    let data = '';
    respuesta.on('data', (chunk) => { data += chunk; });
    respuesta.on('end', () => {
      try {
        const resultado = JSON.parse(data);
        if (resultado.ok) {
          console.log(`[${new Date().toLocaleTimeString()}] Metrica enviada:`);
          console.log(`   Nodo: ${datos.nodo_id.substring(0, 8)}...`);
          console.log(`   Vatios: ${datos.vatios_generados}W | Voltaje: ${datos.voltaje}V`);
          console.log(`   Criticidad: ${datos.criticidad.toUpperCase()} | Status: ${datos.status_code}`);
          console.log('');
        } else {
          console.error('Error al enviar metrica:', resultado.mensaje);
        }
      } catch (_) {
        console.error('Respuesta invalida del servidor');
      }
    });
  });

  req.on('error', (error) => {
    console.error('No se pudo conectar al backend:', error.message);
  });

  req.write(cuerpo);
  req.end();
};

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const iniciar = async () => {
  console.log('Simulador de Nodos Solares');
  console.log('Enviando metricas cada 5 segundos...');
  console.log('Presiona Ctrl+C para detener');
  console.log('');

  let nodosIds = [];

  while (nodosIds.length === 0) {
    try {
      nodosIds = await obtenerNodos();
      console.log(`Nodos cargados: ${nodosIds.length}`);
    } catch (err) {
      console.log('Esperando a la base de datos... reintentando en 3s');
      await esperar(3000);
    }
  }

  enviarMetrica(nodosIds);
  setInterval(() => enviarMetrica(nodosIds), 5000);
};

iniciar();
