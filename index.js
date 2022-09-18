const Discordroxcyrus = require('discord.js');
const roxcyrusmta = require('gamedig');
const roxcyrusconfig = require('./config.json');

const roxcyrus = new Discordroxcyrus.Client({ intents: [Discordroxcyrus.Intents.FLAGS.GUILDS] });
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { config } = require('process');

const commands = [
	new SlashCommandBuilder().setName('sunucu').setDescription('MTA Sunucu İstatistik Komudu by roxcyrus'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(roxcyrusconfig.token);

roxcyrus.once('ready', () => {
	console.log(`Girdi: ${roxcyrus.user.tag}`);
    setInterval(() => {
        roxcyrusmta.query({
            type: 'mtasa',
            host: roxcyrusconfig.server_ip,
            port: roxcyrusconfig.server_port
        }).then((state) => {
            roxcyrus.user.setActivity(`Şuan Sunucuda ${state.raw.numplayers} Kişi`);
        }).catch(err => {
            console.log(err);
        });
    }, 5000);
    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(roxcyrus.user.id, roxcyrusconfig.guildId),
                { body: commands },
            );
    
            console.log('Uygulama komutları başarıyla kaydedildi.');
        } catch (error) {
            console.error(error);
        }
    })();
});

//roxcyrus
roxcyrus.on('interactionCreate', async roxcyrusmsg => {
	if (!roxcyrusmsg.isCommand()) return;

	const { commandName } = roxcyrusmsg;

	if (commandName === 'sunucu') {
		roxcyrusmta.query({
            type: 'mtasa',
            host: roxcyrusconfig.server_ip,
            port: roxcyrusconfig.server_port
        }).then(async (state) => {
            console.log(state)
            var roxcyrusembed = new Discordroxcyrus.MessageEmbed()
            .setTitle(state.name)
            .setColor(`BLUE`)
            .addField(`Harita :`,` - ${state.map}`,true)
            .addField(`Oyun Tipi :`,` - ${state.raw.gametype}`,true)
            .addField(`Geliştirici :`,` - by roxcyrus`,true)
            .addField(`Oyuncular :`,` - ${state.raw.numplayers}/${state.maxplayers}`,true)
            .addField(`Gecikme Süresi:`,` - ${state.ping}ms`,true)
            .addField(`IP/Adres:`,` - ${state.connect}`,true)
            .setTimestamp()
            .setFooter(`Kullandı by ${roxcyrusmsg.member.user.tag}`,roxcyrusmsg.member.user.avatarURL());

            await roxcyrusmsg.reply({ embeds: [roxcyrusembed] });
        }).catch(err => {
            console.log(err);
        });
	} 
});
roxcyrus.login(roxcyrusconfig.token);