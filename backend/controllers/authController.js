// backend/controllers/authController.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('EncomendaTracker.db'); // (Usando a mesma conexão que viagemController)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '3d',
    });
};

exports.register = async (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    try {
        // 1. Verificar se o usuário já existe
        const userExists = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM Users WHERE email = ?', [email], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (userExists) {
            return res.status(400).json({ message: 'Email já cadastrado.' });
        }

        // 2. Criptografar a senha
        const hashedSenha = await bcrypt.hash(senha, 10);
        // 3. Inserir novo usuário no SQLite
        const userId = await new Promise((resolve, reject) => {
            db.run('INSERT INTO Users (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
                [nome, email, hashedSenha, tipo],
                function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID); // Obtém o ID do último registro inserido
                }
            );
        });

        // 4. Criar token JWT
        const token = createToken(userId);
        res.status(201).json({ userId: userId, nome: nome, tipo: tipo, token });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        res.status(500).json({ message: 'Erro ao registrar usuário.', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        // 1. Buscar usuário por email
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM Users WHERE email = ?', [email], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado.' });
        }

        // 2. Comparar senha
        const isMatch = await bcrypt.compare(senha, user.senha);
        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta.' });
        }

        // 3. Criar token
        const token = createToken(user.id); // Use user.id para SQLite
        res.status(200).json({ userId: user.id, nome: user.nome, tipo: user.tipo, token });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ message: 'Erro ao fazer login.', error: err.message });
    }
}