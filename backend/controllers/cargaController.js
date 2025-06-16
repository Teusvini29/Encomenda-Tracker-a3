// backend/controllers/cargaController.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('EncomendaTracker.db'); // Conecta-se ao mesmo DB SQLite

// Criar nova carga
async function criarCarga(req, res) {
  try {
    const { descricao, localAtual, status } = req.body; //

    if (!descricao || !localAtual) { // 'status' pode ter um valor padrão
      return res.status(400).json({ erro: 'Descrição e local atual da carga são obrigatórios.' });
    }

    const sqlInsert = `
      INSERT INTO Cargas (descricao, localAtual, status, dataAtualizacao)
      VALUES (?, ?, ?, datetime('now'))
    `;

    const novaCargaId = await new Promise((resolve, reject) => {
      // Usa o status fornecido ou 'Pendente' como padrão
      const cargaStatus = status || 'Pendente';
      db.run(sqlInsert, [descricao, localAtual, cargaStatus], function(err) {
        if (err) {
          return reject(err);
        }
        resolve(this.lastID); // Retorna o ID da carga recém-criada
      });
    });

    // Opcional: Buscar a carga recém-criada para retornar o objeto completo
    const novaCarga = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM Cargas WHERE id = ?', [novaCargaId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    res.status(201).json(novaCarga); //
  } catch (error) {
    console.error('Erro ao criar carga:', error);
    res.status(500).json({ erro: error.message || 'Erro ao criar carga.' }); //
  }
}

// Buscar todas as cargas
async function listarCargas(req, res) {
  try {
    const cargas = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Cargas', (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    res.status(200).json(cargas); //
  } catch (error) {
    console.error('Erro ao listar cargas:', error);
    res.status(500).json({ erro: error.message || 'Erro ao listar cargas.' }); //
  }
}

// Buscar carga por ID
async function buscarCargaPorId(req, res) {
  try {
    const id = parseInt(req.params.id);

    const carga = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM Cargas WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!carga) {
      return res.status(404).json({ erro: 'Carga não encontrada' }); //
    }

    res.status(200).json(carga); //
  } catch (error) {
    console.error('Erro ao buscar carga por ID:', error);
    res.status(500).json({ erro: error.message || 'Erro ao buscar carga.' }); //
  }
}

// Atualizar carga
async function atualizarCarga(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { descricao, localAtual, status } = req.body; //

    if (!descricao && !localAtual && !status) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar fornecido.' });
    }

    let sqlUpdate = 'UPDATE Cargas SET ';
    const params = [];
    const fields = [];

    if (descricao !== undefined) {
      fields.push('descricao = ?');
      params.push(descricao);
    }
    if (localAtual !== undefined) {
      fields.push('localAtual = ?');
      params.push(localAtual);
    }
    if (status !== undefined) {
      // Garante que o status é um dos valores permitidos, se não for, o CHECK do DB já irá falhar
      fields.push('status = ?');
      params.push(status);
    }
    fields.push('dataAtualizacao = datetime(\'now\')'); // Atualiza a data de atualização

    sqlUpdate += fields.join(', ') + ' WHERE id = ?';
    params.push(id);

    const changes = await new Promise((resolve, reject) => {
      db.run(sqlUpdate, params, function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });

    if (changes === 0) {
      return res.status(404).json({ erro: 'Carga não encontrada ou nenhum dado novo fornecido para atualização.' }); //
    }

    // Opcional: Retornar a carga atualizada
    const cargaAtualizada = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM Cargas WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    res.status(200).json(cargaAtualizada); //
  } catch (error) {
    console.error('Erro ao atualizar carga:', error);
    res.status(500).json({ erro: error.message || 'Erro ao atualizar carga.' }); //
  }
}

// Deletar carga
async function deletarCarga(req, res) {
  try {
    const id = parseInt(req.params.id);

    const changes = await new Promise((resolve, reject) => {
      db.run('DELETE FROM Cargas WHERE id = ?', [id], function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });

    if (changes === 0) {
      return res.status(404).json({ erro: 'Carga não encontrada' }); //
    }

    res.status(200).json({ mensagem: 'Carga deletada com sucesso' }); //
  } catch (error) {
    console.error('Erro ao deletar carga:', error);
    res.status(500).json({ erro: error.message || 'Erro ao deletar carga.' }); //
  }
}
module.exports = {
  criarCarga,
  listarCargas,
  buscarCargaPorId,
  atualizarCarga,
  deletarCarga };