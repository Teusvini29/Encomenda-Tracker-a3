const viagemService = require('../services/viagemService');

// Criar viagem
async function criarViagem(req, res) {
  try {
    const dados = req.body;

    const resultado = await viagemService.criarViagem(dados);

    res.status(201).json({
      mensagem: 'Viagem criada com sucesso!',
      id: resultado.id,
      codigo_rastreamento: resultado.codigo_rastreamento
    });
  } catch (error) {
    console.error('Erro ao criar viagem:', error.message);
    res.status(400).json({ erro: error.message });
  }
}

// Listar as viagens
async function listarViagens(req, res) {
  try {
    const motoristaId = req.query.motorista || null;
    const status = req.query.status || null;

    const viagens = await viagemService.listarViagens(motoristaId, status);
    res.json(viagens);
  } catch (error) {
    console.error('Erro ao listar viagens:', error);
    res.status(500).json({ erro: 'Erro ao listar viagens.' });
  }
}

async function iniciarViagem(req, res) {
  const { id } = req.params;

  try {
    await viagemService.iniciarViagem(id);
    res.json({ mensagem: 'Viagem iniciada com sucesso!' });
  } catch (error) {
    console.error('Erro ao iniciar viagem:', error);
    res.status(500).json({ erro: error.message || 'Erro ao iniciar viagem.' });
  }
}

// Buscar uma viagem por Codigo
async function buscarViagemPorCodigo(req, res) {
  const { codigo } = req.params;

  try {
    const viagem = await viagemService.buscarPorCodigoRastreamento(codigo);
    res.json(viagem);
  } catch (error) {
    console.error('Erro ao buscar viagem por código:', error);
    res.status(404).json({ erro: error.message });
  }
}

// Buscar uma viagem por ID
async function buscarViagemPorId(req, res) {
  const id = parseInt(req.params.id);

  try {
    const viagem = await viagemService.buscarPorId(id);
    res.json(viagem);
  } catch (error) {
    console.error('Erro ao buscar viagem:', error);
    res.status(404).json({ erro: error.message });
  }
}

async function finalizarViagem(req, res) {
  const id = parseInt(req.params.id);

  try {
    await viagemService.finalizarViagem(id);
    res.json({ mensagem: 'Viagem finalizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao finalizar viagem:', error);

    if (error.message === 'Viagem não encontrada') {
      return res.status(404).json({ erro: error.message });
    }

    if (error.message === 'Viagem já se encontra finalizada') {
      return res.status(400).json({ erro: error.message });
    }

    res.status(500).json({ erro: 'Erro ao finalizar viagem.' });
  }
}

async function deletarViagem(req, res) {
  const id = parseInt(req.params.id);

  try {
    await viagemService.deletarViagem(id);
    res.json({ mensagem: 'Viagem deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar viagem:', error);

    if (error.message === 'Viagem não encontrada') {
      return res.status(404).json({ erro: error.message });
    }

    if (error.message === 'Não é permitido deletar uma viagem finalizada') {
      return res.status(400).json({ erro: error.message });
    }

    res.status(500).json({ erro: 'Erro ao deletar viagem.' });
  }
}

module.exports = {
  criarViagem,
  listarViagens,
  buscarViagemPorId,
  buscarViagemPorCodigo,
  iniciarViagem,
  finalizarViagem,
  deletarViagem
};
