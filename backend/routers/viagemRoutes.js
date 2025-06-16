const express = require('express');
const router = express.Router();
const viagemController = require('../controllers/viagemController');

// Criar uma viagem
router.post('/criarViagem', viagemController.criarViagem);

// Deletar viagem
router.delete('/:id', viagemController.deletarViagem);

// Listar as viagens
router.get('/listarViagens', viagemController.listarViagens);

// Buscar uma viagem por ID
router.get('/:id', viagemController.buscarViagemPorId);

// Buscar uma viagem por código de rastreamento
router.get('/codigo/:codigo', viagemController.buscarViagemPorCodigo);

// Iniciar Viagem
router.patch('/:id/iniciar', viagemController.iniciarViagem);

// Finalizar Viagem
router.patch('/:id/finalizar', viagemController.finalizarViagem);

module.exports = router;
