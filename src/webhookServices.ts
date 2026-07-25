import axios from 'axios';
import dotenv from 'dotenv';
import { ITournament } from '../models/Tournament';

dotenv.config();

export async function sendTournamentEmbed(tour: ITournament) {
  const webhookUrl = process.env.WEBHOOK_URL;
  const roleId = process.env.ROLE_ID;

  if (!webhookUrl) return;

  const prizesFormatted = tour.prizepool && tour.prizepool.length > 0
    ? tour.prizepool.map(p => `• **${p.position}º Lugar**: ${p.reward}`).join('\n')
    : 'Nenhum prêmio especificado';

  const mapsFormatted = tour.maps && tour.maps.length > 0 ? tour.maps.join(', ') : 'Todos';
  const emotesFormatted = tour.emotes && tour.emotes.length > 0 ? tour.emotes.join(', ') : 'Todos';

  const contentMention = roleId ? `<@&${roleId}>` : '';

  const embed = {
    title: "New Tour In Stumble Peak",
    description: `Um novo torneio foi criado e já está disponível no jogo!`,
    color: 0xFF0000,
    fields: [
      { name: "📌 Nome do Evento", value: tour.name, inline: true },
      { name: "👥 Party Size (Modo)", value: `${tour.partySize}`, inline: true },
      { name: "⌛ Início Em", value: `${tour.startInMinutes} minutos`, inline: true },
      { name: "💎 Taxa de Inscrição", value: `${tour.entryFee} Gemas`, inline: true },
      { name: "🌍 Região", value: tour.region, inline: true },
      { name: "⚔️ Fases / Jogadores", value: `${tour.phases} Fase(s) | ${tour.playersPerTeam} P/ Time`, inline: true },
      { name: "🏆 Premiação (Prizepool)", value: prizesFormatted, inline: false },
      { name: "🗺️ Mapas (v0.56)", value: mapsFormatted, inline: false },
      { name: "🎭 Emotes Habilitados", value: emotesFormatted, inline: false }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Stumble Peak • Tournament System"
    }
  };

  try {
    await axios.post(webhookUrl, {
      content: contentMention,
      embeds: [embed]
    });
  } catch (error) {
    console.error('Erro ao enviar Webhook para o Discord:', error);
  }
}
