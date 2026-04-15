const { Router } = require('express');
const { verifyJwt } = require('../middleware/auth');
const metricasController = require('../controllers/metricasController');

const router = Router();

router.post('/', metricasController.recibirMetrica);

router.get('/historico',     verifyJwt, metricasController.obtenerHistorico);
router.get('/estado-nodos',  verifyJwt, metricasController.obtenerEstadoNodos);
router.get('/ultimos5min/:nodo_id', verifyJwt, metricasController.obtenerUltimos5Min);
router.get('/',              verifyJwt, metricasController.obtenerMetricas);

module.exports = router;
