const db = require('../config/db');

function inserirViagem(dados) {
  const {
    origem_lat, origem_lng, destino_lat, destino_lng,
    descricao_carga, peso_carga, placa_caminhao,
    motoristaId, codigo_rastreamento
  } = dados;

  const sql = `
    INSERT INTO Viagem (
      origem_lat, origem_lng, destino_lat, destino_lng,
      descricao_carga, peso_carga, placa_caminhao,
      motoristaId, status, codigo_rastreamento
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?)
  `;

  return new Promise((resolve, reject) => {
    db.run(sql, [
      origem_lat, origem_lng, destino_lat, destino_lng,
      descricao_carga, peso_carga, placa_caminhao,
      motoristaId, codigo_rastreamento
    ], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

function listarViagens(motoristaId = null, status = null) {
  let sql = 'SELECT * FROM Viagem';
  const params = [];

  if (motoristaId) {
    sql += ' WHERE motoristaId = ?';
    params.push(motoristaId);
  }

  if (status) {
    sql += ' and status = ?';
    params.push(status);
  }

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function iniciarViagem(id) {
  const sqlUpdate = `
    UPDATE Viagem
    SET status = 'em andamento'
    WHERE id = ?
  `;

  return new Promise((resolve, reject) => {
    db.run(sqlUpdate, [id], function (err) {
      if (err) return reject(err);
      if (this.changes === 0) {
        return reject(new Error('Viagem não encontrada'));
      }
      resolve();
    });
  });
}

function buscarPorCodigoRastreamento(codigo) {
  const sql = 'SELECT v.*, p.latitude AS ultima_latitude, p.longitude AS ultima_longitude FROM Viagem v LEFT JOIN ( SELECT pv.* FROM PosicoesViagem pv WHERE pv.timestamp = ( SELECT MAX(timestamp) FROM PosicoesViagem WHERE viagem_id = pv.viagem_id ) ) p ON p.viagem_id = v.id WHERE v.codigo_rastreamento = ?';

  return new Promise((resolve, reject) => {
    db.get(sql, [codigo], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function buscarPorId(id) {
  const sql = 'SELECT v.*, p.latitude AS ultima_latitude, p.longitude AS ultima_longitude FROM Viagem v LEFT JOIN ( SELECT pv.* FROM PosicoesViagem pv WHERE pv.timestamp = ( SELECT MAX(timestamp) FROM PosicoesViagem WHERE viagem_id = pv.viagem_id ) ) p ON p.viagem_id = v.id WHERE v.id = ?';

  return new Promise((resolve, reject) => {
    db.get(sql, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function atualizarStatus(id, status) {
  const sql = 'UPDATE Viagem SET status = ? WHERE id = ?';

  return new Promise((resolve, reject) => {
    db.run(sql, [status, id], function(err) {
      if (err) return reject(err);
      if (this.changes === 0) {
        return reject(new Error('Viagem não encontrada'));
      }
      resolve();
    });
  });
}

function buscarStatusPorId(id) {
  const sql = 'SELECT status FROM Viagem WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.get(sql, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function finalizarViagem(id) {
  const sqlUpdate = `
    UPDATE Viagem
    SET status = 'entregue',
        data_entrega = datetime('now', '-3 hours')
    WHERE id = ?
  `;
  return new Promise((resolve, reject) => {
    db.run(sqlUpdate, [id], function(err) {
      if (err) return reject(err);
      if (this.changes === 0) {
        return reject(new Error('Viagem não encontrada'));
      }
      resolve();
    });
  });
}

function deletarViagem(id) {
  const sqlDelete = `DELETE FROM Viagem WHERE id = ?`;
  return new Promise((resolve, reject) => {
    db.run(sqlDelete, [id], function(err) {
      if (err) return reject(err);
      if (this.changes === 0) return reject(new Error('Viagem não encontrada'));
      resolve();
    });
  });
}

module.exports = {
  inserirViagem,
  listarViagens,
  iniciarViagem,
  buscarPorCodigoRastreamento,
  buscarPorId,
  atualizarStatus,
  buscarStatusPorId,
  finalizarViagem,
  deletarViagem
};

