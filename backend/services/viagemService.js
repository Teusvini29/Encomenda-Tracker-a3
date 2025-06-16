const viagemRepository = require('../repositories/viagemRepository');
const gerarCodigoRastreamento = require('../utils/gerarCodigoRastreamento');

async function criarViagem(dados) {
  const {
    origem_lat, origem_lng, destino_lat, destino_lng,
    descricao_carga, peso_carga, placa_caminhao,
    motoristaId
  } = dados;

  if (
    origem_lat == null || origem_lng == null ||
    destino_lat == null || destino_lng == null ||
    !placa_caminhao || motoristaId == null
  ) {
    throw new Error('Campos obrigatórios ausentes.');
  }

  const codigo_rastreamento = gerarCodigoRastreamento();

  const id = await viagemRepository.inserirViagem({
    origem_lat, origem_lng, destino_lat, destino_lng,
    descricao_carga, peso_carga, placa_caminhao,
    motoristaId, codigo_rastreamento
  });

  return { id, codigo_rastreamento };
}

async function listarViagens(motoristaId, status) {
  return await viagemRepository.listarViagens(motoristaId, status);
}

async function iniciarViagem(id) {
  return await viagemRepository.iniciarViagem(id);
}

async function buscarPorCodigoRastreamento(codigo, status) {
  const viagem = await viagemRepository.buscarPorCodigoRastreamento(codigo, status);

  if (!viagem) {
    throw new Error('Viagem não encontrada com esse código.');
  }

  return viagem;
}

async function buscarPorId(id) {
  const viagem = await viagemRepository.buscarPorId(id);

  if (!viagem) {
    throw new Error('Viagem não encontrada.');
  }

  return viagem;
}

async function atualizarStatus(id, status) {
  const statusValidos = ['pendente', 'em_transito', 'entregue'];

  if (!statusValidos.includes(status)) {
    throw new Error('Status inválido.');
  }

  await viagemRepository.atualizarStatus(id, status);
}

async function finalizarViagem(id) {
  const viagem = await viagemRepository.buscarStatusPorId(id);

  if (!viagem) {
    throw new Error('Viagem não encontrada');
  }

  if (viagem.status === 'finalizada' || viagem.status === 'entregue') {
    throw new Error('Viagem já se encontra finalizada');
  }

  await viagemRepository.finalizarViagem(id);
}

async function deletarViagem(id) {
  const viagem = await viagemRepository.buscarStatusPorId(id);

  if (!viagem) {
    throw new Error('Viagem não encontrada');
  }

  if (viagem.status === 'finalizada' || viagem.status === 'entregue') {
    throw new Error('Não é permitido deletar uma viagem finalizada');
  }

  await viagemRepository.deletarViagem(id);
}

module.exports = {
  criarViagem,
  listarViagens,
  iniciarViagem,
  buscarPorCodigoRastreamento,
  buscarPorId,
  atualizarStatus,
  finalizarViagem,
  deletarViagem
};