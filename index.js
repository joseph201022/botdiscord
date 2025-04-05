const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Comando per inviare embed con il comando /info
client.on('messageCreate', (message) => {
    if (message.content === '/info') {
        const embed = new EmbedBuilder()
            .setColor(0x3498db) // Colore blu
            .setTitle('Informazioni')
            .setDescription(config.message); // Il messaggio dal config

        message.channel.send({ embeds: [embed] });
    }
});

// Comando per aprire il form, disponibile solo per utenti con un ruolo specifico
client.on('messageCreate', async (message) => {
    const roleId = '1358011192727306272';  // Sostituisci con l'ID del ruolo autorizzato
    const panelChannelId = '1358011269093003354'; // Canale dove viene mandato il pannello

    // Verifica se l'utente ha il ruolo specificato
    if (message.content === '/proposta' && message.member.roles.cache.has(roleId)) {
        // Crea un bottone per aprire la modale
        const button = new ButtonBuilder()
            .setCustomId('openModal')
            .setLabel('Proposta')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('Pannello Delle Proposte')
            .setDescription('Clicca il bottone qui sotto per Proporre.');

        // Invia il pannello nel canale specifico
        const panelChannel = client.channels.cache.get(panelChannelId);
        if (panelChannel) {
            panelChannel.send({ embeds: [embed], components: [row] });
        }
    }
});

// Gestione del bottone per aprire la modale
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'openModal') {
        const modal = new ModalBuilder()
            .setCustomId('domandeModal')
            .setTitle('Compila il form');

        // Definizione dei campi del form
        const domanda1 = new TextInputBuilder()
            .setCustomId('domanda1')
            .setLabel('Proposta')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        // Creare le righe della modale
        modal.addComponents(
            new ActionRowBuilder().addComponents(domanda1)
        );

        await interaction.showModal(modal);
    }

    // Risposta alla modale
    if (interaction.isModalSubmit() && interaction.customId === 'domandeModal') {
        const proposta = interaction.fields.getTextInputValue('domanda1');

        // Creare un embed con le risposte della modale
        const resultEmbed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('Risultato della Fattura')
            .addFields(
                { name: 'Proposta', value: proposta }
            )
            .setTimestamp();

        // Canale dove inviare il risultato
        const resultChannelId = '1358011234347384834'; // Canale dove viene inviato il risultato
        const resultChannel = client.channels.cache.get(resultChannelId);
        if (resultChannel) {
            resultChannel.send({ embeds: [resultEmbed] });
        }

        await interaction.reply({ content: 'Fattura completata con successo!', ephemeral: true });
    }
});

// Comando per il timesheet, disponibile solo per utenti con un ruolo specifico
client.on('messageCreate', async (message) => {
    const roleId = '1287070526342299749'; // Sostituisci con l'ID del ruolo autorizzato

    if (message.content === '/timesheet' && message.member.roles.cache.has(roleId)) {
        // Crea un bottone per aprire la modale del timesheet
        const button = new ButtonBuilder()
            .setCustomId('openTimesheetModal')
            .setLabel('Cartellino')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('Inserisci Ore di lavoro')
            .setDescription('Clicca il bottone qui sotto per inserire i dati delle tue ore di lavoro.');

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// Gestione del bottone per aprire la modale del timesheet
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'openTimesheetModal') {
        const modal = new ModalBuilder()
            .setCustomId('timesheetModal')
            .setTitle('Inserisci Timesheet');

        // Definizione dei campi del form timesheet (max 5 componenti)
        const dataLavoro = new TextInputBuilder()
            .setCustomId('dataLavoro')
            .setLabel('Data del Lavoro')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Inserisci la data (es. 2024-09-20)')
            .setRequired(true);

        const oreLavorate = new TextInputBuilder()
            .setCustomId('oreLavorate')
            .setLabel('Ore Lavorate')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Inserisci le ore (es. 8)')
            .setRequired(true);

        const nomeProgetto = new TextInputBuilder()
            .setCustomId('nomeProgetto')
            .setLabel('Nome del Progetto')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Nome del progetto lavorato')
            .setRequired(true);

        const descrizioneLavoro = new TextInputBuilder()
            .setCustomId('descrizioneLavoro')
            .setLabel('Descrizione del Lavoro')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Descrivi brevemente il lavoro svolto');

        // Creare le righe della modale
        modal.addComponents(
            new ActionRowBuilder().addComponents(dataLavoro),
            new ActionRowBuilder().addComponents(oreLavorate),
            new ActionRowBuilder().addComponents(nomeProgetto),
            new ActionRowBuilder().addComponents(descrizioneLavoro)
        );

        await interaction.showModal(modal);
    }

    // Risposta alla modale del timesheet
    if (interaction.isModalSubmit() && interaction.customId === 'timesheetModal') {
        const dataLavoro = interaction.fields.getTextInputValue('dataLavoro');
        const oreLavorate = interaction.fields.getTextInputValue('oreLavorate');
        const nomeProgetto = interaction.fields.getTextInputValue('nomeProgetto');
        const descrizioneLavoro = interaction.fields.getTextInputValue('descrizioneLavoro');

        // Creare un embed con i dati del timesheet
        const timesheetEmbed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('Nuovo Cartellino Inserito')
            .addFields(
                { name: 'Data del Lavoro', value: dataLavoro },
                { name: 'Ore Lavorate', value: oreLavorate },
                { name: 'Nome del Progetto', value: nomeProgetto },
                { name: 'Descrizione del Lavoro', value: descrizioneLavoro || 'Nessuna descrizione fornita' }
            )
            .setTimestamp();

        // Canale dove inviare il timesheet
        const timesheetChannelId = '1287045051167281247'; // Canale dove viene inviato il timesheet
        const timesheetChannel = client.channels.cache.get(timesheetChannelId);
        if (timesheetChannel) {
            timesheetChannel.send({ embeds: [timesheetEmbed] });
        }

        await interaction.reply({ content: 'Cartellino inserito con successo!', ephemeral: true });
    }
});

// Autorizzazione con il token
client.login(config.token);

// Anti-link con whitelist dei ruoli
client.on('messageCreate', async (message) => {
    const allowedRoleId = '1151169498091634728'; // Sostituisci con l'ID del ruolo che può inviare link

    if (message.content.includes('http') && !message.author.bot) {
        // Verifica se l'utente ha il ruolo che permette l'invio di link
        if (!message.member.roles.cache.has(allowedRoleId)) {
            await message.delete();
            message.channel.send(`${message.author}, non è permesso postare link qui.`);
        }
    }
});

// Comando per aprire il pannello per l'inserimento del link
client.on('messageCreate', async (message) => {
    const roleId = '1287070526342299749';  // Sostituisci con l'ID del ruolo autorizzato
    const panelChannelId = '1291001382744363159'; // Canale dove viene mandato il pannello

    // Verifica se l'utente ha il ruolo specificato
    if (message.content === '/link-panel' && message.member.roles.cache.has(roleId)) {
        // Crea un bottone per aprire la modale
        const button = new ButtonBuilder()
            .setCustomId('openLinkModal')
            .setLabel('Inserisci Link')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('Pannello di Inserimento Link')
            .setDescription('Clicca il bottone qui sotto per inserire un link.');

        // Invia il pannello nel canale specifico
        const panelChannel = client.channels.cache.get(panelChannelId);
        if (panelChannel) {
            panelChannel.send({ embeds: [embed], components: [row] });
        }
    }
});

// Funzione per verificare se un link è valido
function isValidURL(url) {
    const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return regex.test(url);
}

// Gestione del bottone per aprire la modale per inserire un link
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'openLinkModal') {
        const modal = new ModalBuilder()
            .setCustomId('linkModal')
            .setTitle('Inserisci il Link');

        // Campo per inserire il link
        const linkInput = new TextInputBuilder()
            .setCustomId('userLink')
            .setLabel('Inserisci il Link')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Inserisci un URL valido')
            .setRequired(true);

        // Creare la riga della modale
        modal.addComponents(
            new ActionRowBuilder().addComponents(linkInput)
        );

        await interaction.showModal(modal);
    }

    // Risposta alla modale per l'inserimento del link
    if (interaction.isModalSubmit() && interaction.customId === 'linkModal') {
        const userLink = interaction.fields.getTextInputValue('userLink');

        // Verifica se il link inserito è valido
        if (isValidURL(userLink)) {
            // Creare un embed con il link inserito dall'utente
            const linkEmbed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle('Nuovo Link Inserito')
                .addFields(
                    { name: 'Link', value: userLink }
                )
                .setTimestamp();

            // Canale dove inviare il link
            const linkChannelId = '1291092983453712467'; // Sostituisci con l'ID del canale dove inviare il link
            const linkChannel = client.channels.cache.get(linkChannelId);
            if (linkChannel) {
                linkChannel.send({ embeds: [linkEmbed] });
            }

            await interaction.reply({ content: 'Link inserito con successo!', ephemeral: true });
        } else {
            // Invia un messaggio di errore se il link non è valido
            await interaction.reply({ content: 'Il link inserito non è valido. Assicurati di inserire un URL corretto.', ephemeral: true });
        }
    }
});

