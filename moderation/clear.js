const Discord = require("discord.js")
const db = require('quick.db')
const owner = new db.table("Owner")
const config = require("../config")
const cl = new db.table("Color")
const ml = new db.table("modlog")
const p2 = new db.table("Perm2")
const p3 = new db.table("Perm3")

module.exports = {
    name: 'clear',
    usage: 'clear <nombre> ou @membre',
    description: `Permet de supprimer des messages`,
    async execute(client, message, args) {
        const perm3 = p3.fetch(`perm3_${message.guild.id}`)
        const perm2 = p2.fetch(`perm2_${message.guild.id}`)
        
        // Vérifier si l'utilisateur a les permissions nécessaires
        if (!owner.get(`owners.${message.author.id}`) &&
            !message.member.roles.cache.has(perm3) &&
            !message.member.roles.cache.has(perm2) &&
            !config.bot.buyer.includes(message.author.id)) {
            return message.reply(" Vous n'avez pas la permission d'utiliser cette commande !");
        }

        message.delete().catch(() => false);
        
        // Suppression des messages d'un utilisateur spécifique
        if (message.mentions.members.first()) {
            let targetUser = message.mentions.members.first();
            let deletedMessages = 0;

            async function deleteUserMessages() {
                let fetchedMessages;
                do {
                    fetchedMessages = await message.channel.messages.fetch({ limit: 100 }).catch(() => null);
                    if (!fetchedMessages) break;

                    let filteredMessages = fetchedMessages.filter(m => m.author.id === targetUser.id);
                    if (filteredMessages.size > 0) {
                        await message.channel.bulkDelete(filteredMessages, true).then(deleted => {
                            deletedMessages += deleted.size;
                        }).catch(() => null);
                    }
                } while (fetchedMessages.size > 0);
            }

            await deleteUserMessages();

            let color = cl.fetch(`color_${message.guild.id}`) || config.bot.couleur;

            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setDescription(`<@${message.author.id}> a supprimé **${deletedMessages}** messages de <@${targetUser.id}> dans <#${message.channel.id}>`)
                .setTimestamp()
                .setFooter({ text: `📚` });

            const logchannel = client.channels.cache.get(ml.get(`${message.guild.id}.modlog`));
            if (logchannel) logchannel.send({ embeds: [embed] }).catch(() => false);

            return;
        }

        // Suppression d'un certain nombre de messages
        if (!isNaN(args[0])) {
            let amount = parseInt(args[0]);

            if (amount <= 0) return message.reply(" Le nombre de messages à supprimer doit être supérieur à 0 !");
            if (amount > 100) amount = 100; // Discord n'autorise que la suppression de 100 messages à la fois

            await message.channel.bulkDelete(amount, true).then(deleted => {
                let color = cl.fetch(`color_${message.guild.id}`) || config.bot.couleur;

                const embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setDescription(`<@${message.author.id}> a supprimé **${deleted.size}** message(s) dans <#${message.channel.id}>`)
                    .setTimestamp()
                    .setFooter({ text: `📚` });

                const logchannel = client.channels.cache.get(ml.get(`${message.guild.id}.modlog`));
                if (logchannel) logchannel.send({ embeds: [embed] }).catch(() => false);
            }).catch(() => {
                message.reply(" Impossible de supprimer certains messages (ils datent de plus de 14 jours ou une erreur est survenue).");
            });

            return;
        }

        // Suppression de 100 messages par défaut
        await message.channel.bulkDelete(100, true).then(deleted => {
            let color = cl.fetch(`color_${message.guild.id}`) || config.bot.couleur;

            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setDescription(`<@${message.author.id}> a supprimé **${deleted.size}** messages dans <#${message.channel.id}>`)
                .setTimestamp()
                .setFooter({ text: `📚` });

            const logchannel = client.channels.cache.get(ml.get(`${message.guild.id}.modlog`));
            if (logchannel) logchannel.send({ embeds: [embed] }).catch(() => false);
        }).catch(() => {
            message.reply(" Impossible de supprimer certains messages.");
        });
    }
};
