module.exports = function gerarCodigoRastreamento() {
  return 'R-' + Math.random().toString(36).substring(2, 10).toUpperCase();
};
