const posicaoService = require('../services/posicaoService');

async function salvarPosicao(req, res) {
  const viagemId = req.params.id;
  const { latitude, longitude } = req.body;

  try {
    await posicaoService.salvarPosicao(viagemId, latitude, longitude);
    res.status(201).json({ mensagem: 'Posição registrada com sucesso.' });
  } catch (error) {
    console.error('Erro ao salvar posição:', error);

    if (error.message === 'Dados incompletos.') {
      return res.status(400).json({ erro: error.message });
    }

    res.status(500).json({ erro: 'Erro ao salvar posição.' });
  }
}

module.exports = {
    salvarPosicao
};
