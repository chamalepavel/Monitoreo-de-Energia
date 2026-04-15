const { Router } = require('express');
const { verifyJwt } = require('../middleware/auth');
const nodosController = require('../controllers/nodosController');

const router = Router();

router.get('/', verifyJwt, nodosController.listarNodos);
router.get('/:id', verifyJwt, nodosController.obtenerNodo);

module.exports = router;
