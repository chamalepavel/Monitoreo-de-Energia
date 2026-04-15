const http = require('http');

const API_URL = 'http://localhost:4000/api/metricas';

const NODOS_IDS = [
  '93093cfa-bc67-449a-b705-b41520e62bad',
  'ad669bf5-3be2-46d1-8253-5986efdf4a53',
  'afa82e60-5b98-4ed4-81ea-25ae2aca680a',
  '06f9b60c-fd67-474e-acb3-b92331dc89ab',
  '977933d5-cfcf-4d77-8290-9c1cbc6b4e4a',
];

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

const generarMetrica = () => {
  const nodo_id  = NODOS_IDS[Math.floor(Math.random() * NODOS_IDS.length)];
  const esError  = Math.random() < 0.1;

  const vatios_generados = esError ? aleatorio(200, 1500) : aleatorio(2000, 5000);
  const voltaje          = esError ? aleatorio(160, 200)  : aleatorio(210, 240);

  const { criticidad, status_code, mensaje } = determinarCriticidad(vatios_generados, voltaje);

  return { nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje };
};

const enviarMetrica = () => {
  const datos  = generarMetrica();
  const cuerpo = JSON.stringify(datos);

  const opciones = {
    hostname: 'localhost',
    port: 4000,
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
    console.error('Asegurate de que el backend esta corriendo: npm run dev (en /backend)');
  });

  req.write(cuerpo);
  req.end();
};

console.log('Simulador de Nodos Solares');
console.log('Enviando metricas cada 5 segundos...');
console.log('Presiona Ctrl+C para detener');
console.log('');

enviarMetrica();
setInterval(enviarMetrica, 5000);
