const express = require('express');
const router = express.Router();
const posicaoController = require('../controllers/posicaoController');

// Salvar Posição
router.post('/:id/salvar', posicaoController.salvarPosicao);

module.exports = router;
