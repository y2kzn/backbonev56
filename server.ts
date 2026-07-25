import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tournament } from './models/Tournament';
import { MAPS_v056, EMOTES_v056 } from './constants/v056Data';
import { sendTournamentEmbed } from './services/webhookService';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('MongoDB Conectado com Sucesso!'))
  .catch(err => console.error('Erro no MongoDB:', err));

// Endpoint consumido diretamente pelo jogo
app.get('/api/tournaments/list', async (req, res) => {
  try {
    const tours = await Tournament.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: tours.length, tournaments: tours });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao listar torneios.' });
  }
});

// Criar torneio via Dashboard Web e disparar o Webhook no Discord
app.post('/api/tournaments/create', async (req, res) => {
  try {
    const { name, phases, playersPerTeam, partySize, gameMode, startInMinutes, entryFee, region, prizepoolRaw, maps, emotes } = req.body;

    const parsedPrize = String(prizepoolRaw).split(',').map(item => {
      const [pos, val] = item.split(':').map(s => s.trim());
      return { position: Number(pos), reward: Number(val) };
    }).filter(p => !isNaN(p.position) && !isNaN(p.reward));

    const newTournament = new Tournament({
      name,
      phases: Number(phases) || 1,
      playersPerTeam: Number(playersPerTeam) || 32,
      partySize: Number(partySize) || 1,
      gameMode: gameMode || 'Padrão',
      startInMinutes: Number(startInMinutes) || 15,
      entryFee: Number(entryFee) || 0,
      region: region || 'South America (SA)',
      prizepool: parsedPrize,
      maps: Array.isArray(maps) ? maps : [maps].filter(Boolean),
      emotes: Array.isArray(emotes) ? emotes : [emotes].filter(Boolean)
    });

    await newTournament.save();

    // Notifica no canal do Discord
    await sendTournamentEmbed(newTournament);

    return res.redirect('/admin');
  } catch (err) {
    return res.status(500).send('Erro ao criar torneio via Web');
  }
});

// Painel Admin estilo Fake Admin
app.get('/admin', (req, res) => {
  const mapOptions = MAPS_v056.map(m => `<option value="${m}">${m}</option>`).join('');
  const emoteOptions = EMOTES_v056.map(e => `<option value="${e}">${e}</option>`).join('');

  const html = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>Fake Admin - Criar Torneio</title>
    <style>
      body { background-color: #0d0d0d; color: #fff; font-family: sans-serif; margin: 0; display: flex; }
      .sidebar { width: 220px; background-color: #121212; height: 100vh; padding: 20px; border-right: 1px solid #222; }
      .sidebar h2 { color: #ff1a1a; font-size: 18px; margin-bottom: 30px; }
      .sidebar a { display: block; color: #888; text-decoration: none; padding: 10px 0; font-size: 14px; }
      .sidebar a.active { color: #ff1a1a; font-weight: bold; }
      .main { flex: 1; padding: 40px; }
      .card { background-color: #161616; border: 1px solid #262626; border-radius: 8px; padding: 25px; }
      .card-title { color: #ff1a1a; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px; }
      .field { display: flex; flex-direction: column; gap: 5px; }
      label { font-size: 11px; color: #888; text-transform: uppercase; font-weight: bold; }
      input, select { background-color: #0d0d0d; border: 1px solid #262626; color: #fff; padding: 10px; border-radius: 4px; font-size: 13px; outline: none; }
      input:focus, select:focus { border-color: #ff1a1a; }
      select[multiple] { height: 120px; }
      button { background-color: #ff1a1a; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 15px; }
      button:hover { background-color: #cc0000; }
    </style>
  </head>
  <body>
    <div class="sidebar">
      <h2>🛡️ Fake Admin</h2>
      <a href="#">Visão Geral</a>
      <a href="#" class="active">Criar Torneio</a>
      <a href="#">Sistema de W.O.</a>
      <a href="#">Configurações</a>
    </div>
    <div class="main">
      <div class="card">
        <div class="card-title">┼ Configurar Novo Evento</div>
        <form action="/api/tournaments/create" method="POST">
          <div class="grid">
            <div class="field">
              <label>NOME DO EVENTO</label>
              <input type="text" name="name" placeholder="Ex: Torneio Fake Semanal" required />
            </div>
            <div class="field">
              <label>QUANTIDADE DE FASES</label>
              <input type="number" name="phases" value="1" />
            </div>
            <div class="field">
              <label>JOGADORES P/ TIME</label>
              <input type="number" name="playersPerTeam" value="32" />
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <label>MEMBROS PARTY (MODO DO TOUR)</label>
              <input type="number" name="partySize" value="1" placeholder="1=Solo, 2=Duo, 4=Squad" />
            </div>
            <div class="field">
              <label>MODO DE JOGO</label>
              <select name="gameMode"><option value="Padrão">Padrão</option></select>
            </div>
            <div class="field">
              <label>INÍCIO EM (MINUTOS)</label>
              <input type="number" name="startInMinutes" value="15" />
            </div>
          </div>
          <div class="grid">
            <div class="field">
              <label>TAXA DE INSCRIÇÃO (GEMAS)</label>
              <input type="number" name="entryFee" value="0" />
            </div>
            <div class="field">
              <label>REGIÃO DO SERVIDOR</label>
              <select name="region">
                <option value="South America (SA)">South America (SA)</option>
                <option value="North America (NA)">North America (NA)</option>
                <option value="Europe (EU)">Europe (EU)</option>
              </select>
            </div>
            <div class="field">
              <label>PREMIAÇÃO (POSIÇÃO:VALOR)</label>
              <input type="text" name="prizepoolRaw" placeholder="1:6000, 2:2000, 3:1000, 4:1000" />
            </div>
          </div>
          <div class="grid" style="grid-template-columns: 1fr 1fr;">
            <div class="field">
              <label>MAPAS DO TORNEIO (0.56)</label>
              <select name="maps" multiple>${mapOptions}</select>
            </div>
            <div class="field">
              <label>EMOTES HABILITADOS (0.56)</label>
              <select name="emotes" multiple>${emoteOptions}</select>
            </div>
          </div>
          <button type="submit">CRIAR TORNEIO AUTOMÁTICO</button>
        </form>
      </div>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

// Configurado para porta 80
const PORT = Number(process.env.PORT) || 80;
app.listen(PORT, () => console.log(`Servidor rodando com sucesso na porta ${PORT}`));
