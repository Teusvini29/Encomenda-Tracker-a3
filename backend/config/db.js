const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('EncomendaTracker.db'); //

const sqlCreateTableViagem = `
CREATE TABLE IF NOT EXISTS Viagem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  origem_lat REAL NOT NULL,
  origem_lng REAL NOT NULL,
  destino_lat REAL NOT NULL,
  destino_lng REAL NOT NULL,
  descricao_carga TEXT,
  peso_carga REAL,
  placa_caminhao TEXT NOT NULL,
  motoristaId INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_criacao DATETIME NOT NULL DEFAULT (datetime('now', '-3 hours')),
  data_entrega DATETIME NULL,
  codigo_rastreamento TEXT UNIQUE NOT NULL
);
`;

const sqlCreatePosicoes = `
CREATE TABLE IF NOT EXISTS PosicoesViagem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  viagem_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (viagem_id) REFERENCES Viagem(id) ON DELETE CASCADE
);
`;

module.exports = db;
