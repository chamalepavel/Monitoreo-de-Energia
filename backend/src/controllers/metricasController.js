const metricasService = require('../services/metricasService');

const recibirMetrica = async (req, res) => {
  try {
    const { nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje } = req.body;

    if (!nodo_id || vatios_generados === undefined || voltaje === undefined) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Faltan campos obligatorios: nodo_id, vatios_generados, voltaje',
      });
    }

    const criticidadesValidas = ['info', 'warning', 'error'];
    if (criticidad && !criticidadesValidas.includes(criticidad)) {
      return res.status(400).json({
        ok: false,
        mensaje: `Criticidad invalida. Debe ser: ${criticidadesValidas.join(', ')}`,
      });
    }

    const metricaGuardada = await metricasService.guardarMetrica({
      nodo_id,
      vatios_generados: parseFloat(vatios_generados),
      voltaje:          parseFloat(voltaje),
      status_code:      parseInt(status_code) || 200,
      criticidad:       criticidad || 'info',
      mensaje:          mensaje || '',
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('nueva-metrica', metricaGuardada);

      if (metricaGuardada.criticidad === 'error') {
        io.emit('alerta-critica', {
          nodo_id:          metricaGuardada.nodo_id,
          mensaje:          metricaGuardada.mensaje,
          timestamp:        metricaGuardada.timestamp,
          vatios_generados: metricaGuardada.vatios_generados,
          voltaje:          metricaGuardada.voltaje,
        });
      }
    }

    res.status(201).json({
      ok: true,
      mensaje: 'Metrica guardada exitosamente',
      datos: metricaGuardada,
    });

  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nodo_id no existe en la base de datos',
      });
    }
    console.error('Error al guardar metrica:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error interno al guardar la metrica' });
  }
};

const obtenerMetricas = async (req, res) => {
  try {
    const { rango, criticidad, busqueda, limite } = req.query;
    const metricas = await metricasService.obtenerMetricas({
      rango,
      criticidad,
      busqueda,
      limite: limite ? parseInt(limite) : 100,
    });
    res.status(200).json({ ok: true, cantidad: metricas.length, datos: metricas });
  } catch (error) {
    console.error('Error al obtener metricas:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error interno' });
  }
};

const obtenerUltimos5Min = async (req, res) => {
  try {
    const { nodo_id } = req.params;
    const datos = await metricasService.obtenerUltimos5Min(nodo_id);
    res.status(200).json({ ok: true, nodo_id, datos });
  } catch (error) {
    console.error('Error al obtener ultimos 5 min:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error interno' });
  }
};

const obtenerHistorico = async (req, res) => {
  try {
    const { agrupacion } = req.query;
    const datos = await metricasService.obtenerHistoricoBarras(agrupacion || 'dia');
    res.status(200).json({ ok: true, agrupacion: agrupacion || 'dia', datos });
  } catch (error) {
    console.error('Error al obtener historico:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error interno' });
  }
};

const obtenerEstadoNodos = async (req, res) => {
  try {
    const datos = await metricasService.obtenerEstadoNodos();
    res.status(200).json({ ok: true, datos });
  } catch (error) {
    console.error('Error al obtener estado de nodos:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error interno' });
  }
};

module.exports = {
  recibirMetrica,
  obtenerMetricas,
  obtenerUltimos5Min,
  obtenerHistorico,
  obtenerEstadoNodos,
};
