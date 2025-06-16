const db = require('../config/db');

function salvarPosicao(viagemId, latitude, longitude) {
  const sql = `
    INSERT INTO PosicoesViagem (viagem_id, latitude, longitude, timestamp)
    VALUES (?, ?, ?, datetime('now', '-3 hours'))
  `;
  return new Promise((resolve, reject) => {
    db.run(sql, [viagemId, latitude, longitude], function(err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
    salvarPosicao
};