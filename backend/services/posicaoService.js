const posicaoRepository = require('../repositories/posicaoRepository');

async function salvarPosicao(viagemId, latitude, longitude) {
  if (!latitude || !longitude) {
    throw new Error('Dados incompletos.');
  }

  await posicaoRepository.salvarPosicao(viagemId, latitude, longitude);
}

module.exports = {
    salvarPosicao
};