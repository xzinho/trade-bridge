const express = require('express');
const app = express();

app.use(express.json());
app.use(express.text({ type: '*/*' }));

// Armazena os sinais em memória
let signals = [];
let signalIdCounter = 0;

// Rota para o NT8 ENVIAR sinais
app.get('/send', (req, res) => {
  const action = req.query.action;
  
  if (!action) {
    return res.status(400).send('Missing action');
  }
  
  signalIdCounter++;
  const signal = {
    id: signalIdCounter,
    action: action.toUpperCase(),
    timestamp: Date.now()
  };
  
  signals.push(signal);
  
  // Mantém apenas os últimos 50 sinais
  if (signals.length > 50) {
    signals = signals.slice(-50);
  }
  
  console.log(`[SEND] Signal received: ${signal.action} (id: ${signal.id})`);
  res.send(`OK:${signal.id}`);
});

// Rota para o MT5 BUSCAR sinais novos
app.get('/get', (req, res) => {
  const lastId = parseInt(req.query.last_id) || 0;
  const newSignals = signals.filter(s => s.id > lastId);
  
  if (newSignals.length === 0) {
    return res.send('NONE');
  }
  
  // Retorna o mais recente
  const latest = newSignals[newSignals.length - 1];
  console.log(`[GET] Client fetched: ${latest.action} (id: ${latest.id})`);
  res.send(`${latest.id}|${latest.action}`);
});

// Rota de status
app.get('/', (req, res) => {
  res.send(`Trade Bridge Online. Signals in memory: ${signals.length}`);
});

// Rota para limpar sinais (útil para testes)
app.get('/clear', (req, res) => {
  signals = [];
  signalIdCounter = 0;
  res.send('CLEARED');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Trade Bridge running on port ${PORT}`);
});
