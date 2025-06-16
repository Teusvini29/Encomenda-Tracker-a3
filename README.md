# 📦 Encomenda Tracker

Sistema web para gestão e rastreamento de viagens de encomendas, com validação de dados, geolocalização automática, integração com mapas e cadastro eficiente de motoristas e cargas.

---

## 🚀 Como rodar o projeto

### 📁 Estrutura de pastas

- `backend/` → Node.js + Express (API REST)
- `frontend/` → HTML, CSS, JS puro

---

### ⚙️ Requisitos

- Node.js v18 ou superior
- Navegador moderno (Chrome, Firefox, etc.)
- Extensão recomendada: Live Server (VSCode)

---

### ▶️ Backend

1. Acesse a pasta:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor:

```bash
node server.js
```

> Servidor disponível em: http://localhost:3000

---

### 💻 Frontend

1. Acesse a pasta:

```bash
cd frontend
```

2. Abra o arquivo `index.html` no navegador

> Dica: use "Live Server" para recarregamento automático

---

## ✨ Funcionalidades

### 📍 Cadastro de Viagem

- Descrição da carga
- Peso com validação numérica
- Placa do caminhão com validação (formato ABC1D23)
- ID do motorista (validação numérica)
- Endereço de origem e destino (CEP + número)
- Conversão de endereço para coordenadas (Geocoding)
- Conversão reversa para exibir o endereço (Reverse Geocoding)
- Acompanhamento pelo Mapa em Tempo Real

### 🚗 Funcionalidade do Motorista
- Iniciar Viagem
- Acompanhamento pelo Mapa em Tempo Real
- Finalizar Viagem

### 📦 Rastreamento

- Geração de código de rastreamento único
- Acompanhamento em tempo real pelo mapa (atualizado a cada 10s)
- Status visual:
  - ⏳ Pendente
  - 🚚 Em andamento
  - ✅ Entregue

### 🧠 Validações

- Mensagens de erro explicativas
- Exibição em modal com Bootstrap
- Loading ao criar viagem

### 🌐 APIs Utilizadas

- [ViaCEP](https://viacep.com.br) → CEP → Endereço
- [Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org) → Endereço → Coordenadas (e vice-versa)
- [Leaflet](https://leafletjs.com/) → Integração com mapas

---

## 🏗️ Arquitetura do Backend

### 🔄 Padrão de Projeto: Repository + Clean Architecture

Organização modular e escalável:

```
backend/
├── controllers/       # Interfaces com o frontend
├── services/          # Regras de negócio
├── repositories/      # Acesso ao banco de dados (SQLite)
├── models/            # Entidades, DTOs
└── utils/             # Funções auxiliares e integração externa
```

---

## 📈 Futuras melhorias

- Autenticação de usuários
- Notificação de desvio de rotas, viagens entregues, viagens canceladas, etc.
- Upload de comprovante de entrega
- Testes automatizados (Jest)

---
