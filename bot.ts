import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tournament } from './models/Tournament';
import { User } from './models/User';
import { MAPS_v056, EMOTES_v056 } from './constants/v056Data';
import { sendTournamentEmbed } from './services/webhookService';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  // /create tour
  new SlashCommandBuilder()
    .setName('create')
    .setDescription('Comandos de criação')
    .addSubcommand(sub =>
      sub
        .setName('tour')
        .setDescription('Cria um novo torneio diretamente no MongoDB')
        .addStringOption(opt => opt.setName('nome').setDescription('Nome do torneio').setRequired(true))
        .addIntegerOption(opt => opt.setName('partysize').setDescription('Tamanho da party (Ex: 1=Solo, 2=Duo)').setRequired(true))
        .addStringOption(opt => opt.setName('prizepool').setDescription('Divisão de prêmios (ex: 1:6000, 2:2000, 3:1000)').setRequired(true))
        .addIntegerOption(opt => opt.setName('minutos').setDescription('Tempo para iniciar em minutos').setRequired(false))
    ),

  // /addwin
  new SlashCommandBuilder()
    .setName('addwin')
    .setDescription('Adiciona +1 vitória em torneio para um jogador no ranking')
    .addUserOption(opt => opt.setName('usuario').setDescription('Usuário a receber +1 torneio').setRequired(true)),

  // /rank
  new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Mostra o Top Ranking de torneios vencidos')
];

client.once('ready', async () => {
  console.log(`Bot conectado como ${client.user?.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || '');
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID || ''),
      { body: commands }
    );
    console.log('Slash Commands registrados com sucesso.');
  } catch (err) {
    console.error('Erro ao registrar Slash Commands:', err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // Comando /create tour
  if (interaction.commandName === 'create') {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'tour') {
      const name = interaction.options.getString('nome', true);
      const partySize = interaction.options.getInteger('partysize', true);
      const prizeRaw = interaction.options.getString('prizepool', true);
      const startInMinutes = interaction.options.getInteger('minutos') || 15;

      const parsedPrize = prizeRaw.split(',').map(item => {
        const [pos, val] = item.split(':').map(s => s.trim());
        return { position: Number(pos), reward: Number(val) };
      }).filter(p => !isNaN(p.position) && !isNaN(p.reward));

      const newTour = new Tournament({
        name,
        partySize,
        startInMinutes,
        prizepool: parsedPrize,
        maps: MAPS_v056.slice(0, 5),
        emotes: EMOTES_v056
      });

      await newTour.save();

      // Envia notificação Embed via Webhook
      await sendTournamentEmbed(newTour);

      return interaction.reply({
        content: `✅ Torneio **${name}** criado e anunciado via Webhook com sucesso!`
      });
    }
  }

  // Comando /addwin
  if (interaction.commandName === 'addwin') {
    const targetUser = interaction.options.getUser('usuario', true);

    let userDoc = await User.findOne({ discordId: targetUser.id });
    if (!userDoc) {
      userDoc = new User({
        discordId: targetUser.id,
        username: targetUser.username,
        tournamentsWonCount: 1
      });
    } else {
      userDoc.tournamentsWonCount += 1;
    }

    await userDoc.save();

    return interaction.reply({
      content: `🏆 **+1 Torneio** adicionado para <@${targetUser.id}>! Total: **${userDoc.tournamentsWonCount} torneios**.`,
    });
  }

  // Comando /rank
  if (interaction.commandName === 'rank') {
    const topUsers = await User.find().sort({ tournamentsWonCount: -1 }).limit(10);

    if (topUsers.length === 0) {
      return interaction.reply({ content: 'Nenhum jogador registrado no ranking ainda.' });
    }

    const leaderboardText = topUsers.map((u, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
      return `${medal} **#${index + 1}** - <@${u.discordId}>: **${u.tournamentsWonCount} Torneios**`;
    }).join('\n');

    const rankEmbed = new EmbedBuilder()
      .setTitle('🏆 Top Ranking de Torneios - Stumble Peak')
      .setDescription(leaderboardText)
      .setColor(0xFF0000)
      .setTimestamp()
      .setFooter({ text: 'Stumble Peak Leaderboard' });

    return interaction.reply({ embeds: [rankEmbed] });
  }
});

mongoose.connect(process.env.MONGO_URI || '').then(() => {
  client.login(process.env.DISCORD_TOKEN);
});
