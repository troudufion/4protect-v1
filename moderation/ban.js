const Discord = require("discord.js")
const db = require('quick.db')
const owner = new db.table("Owner")
const cl = new db.table("Color")
const config = require("../config")
const fs = require('fs')
const moment = require('moment')
const pgs = new db.table("PermGs");
const ml = new db.table("modlog")
const p3 = new db.table("Perm3")

module.exports = {
    name: 'ban',
    usage: 'ban <membre>',
    description: `Permet de bannir un membre.`,
    async execute(client, message, args) {

        let color = cl.fetch(`color_${message.guild.id}`)
        if (color == null) color = config.bot.couleur
        const perm3 = p3.fetch(`perm3_${message.guild.id}`);

        // Vérification des permissions
        if (owner.get(`owners.${message.author.id}`) || 
            message.member.roles.cache.has(perm3) || 
            config.bot.buyer.includes(message.author.id) || 
            message.member.roles.cache.has(pgs.get(`permgs_${message.guild.id}`)) === true) {

            // Essai de récupérer le membre par mention ou ID
            let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
            if (!member) {
                try {
                    member = await client.users.fetch(args[0])
                } catch(e) {
                    member = null
                }
            }
            // Si toujours introuvable, vérifier si le message est une réponse
            if (!member && message.reference) {
                try {
                    const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                    member = repliedMessage.member;
                } catch (err) {
                    member = null;
                }
            }

            if (!member) {
                return message.reply("Merci de mentionner l'utilisateur, fournir son ID ou répondre au message de l'utilisateur que vous souhaitez bannir !");
            }

            if (member.id === message.author.id) {
                return message.reply("Tu ne peux pas te bannir !");
            }

            let reason = args.slice(1).join(" ") || `Aucune raison`

            message.reply({ content: `${member} a été banni du serveur` }).catch(err => err)
            member.send({ content: `Tu as été banni par ${message.author} pour la raison suivante :\n\n${reason}` }).catch(() => {});
            member.ban({ reason: `${reason}` })

            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setDescription(`<@${message.author.id}> a \`banni\` ${member} du serveur\nRaison : ${reason}`)
                .setTimestamp()
                .setFooter({ text: `📚` })
            const logchannel = client.channels.cache.get(ml.get(`${message.guild.id}.modlog`))
            if (logchannel) logchannel.send({ embeds: [embed] }).catch(() => false)
        }

        // Deuxième cas de vérification pour certains rôles spécifiques
        else if (message.member.roles.cache.has(p3.get(`perm3_${message.guild.id}`)) === true) {

            let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
            // Vérifier si le message est une réponse
            if (!member && message.reference) {
                try {
                    const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                    member = repliedMessage.member;
                } catch (err) {
                    member = null;
                }
            }

            if (!member) {
                return message.reply("Merci de mentionner l'utilisateur, fournir son ID ou répondre au message de l'utilisateur que vous souhaitez bannir !");
            }

            if (member.id === message.author.id) {
                return message.reply("Tu ne peux pas te bannir !");
            }

            if (member.roles.highest.position >= message.member.roles.highest.position || message.author.id !== message.guild.owner.id) {
                return message.reply(`Vous ne pouvez pas bannir un membre au-dessus de vous`)
            }

            if (owner.get(`owners.${message.author.id}`) || config.bot.buyer.includes(message.author.id) === true)
                return message.reply("Tu ne peux pas le bannir ! Il est owner du bot.")

            let reason = args.slice(1).join(" ") || `Aucune raison`

            message.reply({ content: `${member} a été banni du serveur` }).catch(err => err)
            member.send({ content: `Tu as été banni par ${message.author} pour la raison suivante :\n\n${reason}` }).catch(() => {});
            member.ban({ reason: `${reason}` })

            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setDescription(`<@${message.author.id}> a \`banni\` ${member} du serveur\nRaison : ${reason}`)
                .setTimestamp()
                .setFooter({ text: `📚` })
            const logchannel = client.channels.cache.get(ml.get(`${message.guild.id}.modlog`))
            if (logchannel) logchannel.send({ embeds: [embed] }).catch(() => false)
        }
    }
}
