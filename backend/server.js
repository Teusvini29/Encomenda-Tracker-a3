// backend/server.js
const express = require('express');
const cors = require('cors');

const viagemRoutes = require('./routers/viagemRoutes');
const posicaoRoutes = require('./routers/posicaoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/viagem', viagemRoutes);
app.use('/posicao', posicaoRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
})