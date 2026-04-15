const nodosService = require('../services/nodosService');

const listarNodos = async (req, res) => {
  try {
    const nodos = await nodosService.obtenerTodosLosNodos();
    res.status(200).json({
      ok: true,
      cantidad: nodos.length,
      datos: nodos,
    });
  } catch (error) {
    console.error('Error al listar nodos:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error interno al obtener los nodos' });
  }
};

const obtenerNodo = async (req, res) => {
  try {
    const { id } = req.params;
    const nodo = await nodosService.obtenerNodoPorId(id);

    if (!nodo) {
      return res.status(404).json({ ok: false, mensaje: `No se encontro el nodo con ID: ${id}` });
    }

    res.status(200).json({ ok: true, datos: nodo });
  } catch (error) {
    console.error('Error al obtener nodo:', error.message);
    res.status(500).json({ ok: false, mensaje: 'Error interno al obtener el nodo' });
  }
};

module.exports = { listarNodos, obtenerNodo };
