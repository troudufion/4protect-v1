const Discord = require("discord.js");
const db = require('quick.db');
const owner = new db.table("Owner");
const p = new db.table("Prefix");
const config = require("../config");
const p1 = new db.table("Perm1");
const p2 = new db.table("Perm2");
const p3 = new db.table("Perm3");
const ml = new db.table("modlog");
const footer = config.bot.footer;
const couleur = config.bot.couleur;

module.exports = {
    name: 'unmute',
    usage: 'unmute [<membre>/all]',
    description: `Permet de ne plus rendre muet un utilisateur ou tous les utilisateurs`,
    async execute(client, message, args) {
        let pf = p.fetch(`prefix_${message.guild.id}`);
        if (pf == null) pf = config.bot.prefixe;

        const perm1 = p1.fetch(`perm1_${message.guild.id}`);
        const perm2 = p2.fetch(`perm2_${message.guild.id}`);
        const perm3 = p3.fetch(`perm3_${message.guild.id}`);
        const modlogChannel = ml.get(`${message.guild.id}.modlog`);

        if (owner.get(`owners.${message.author.id}`) || 
            message.member.roles.cache.has(perm1) || 
            message.member.roles.cache.has(perm2) || 
            message.member.roles.cache.has(perm3) || 
            config.bot.buyer.includes(message.author.id) === true) {

            if (!args[0]) {
                return message.channel.send(`Veuillez mentionner un utilisateur, fournir son ID ou utiliser "all" pour unmute tout le monde !`);
            }

            // Si "all" est spécifié, on unmute tous les membres muets
            if (args[0].toLowerCase() === "all") {
                let members = message.guild.members.cache.filter(member => member.isCommunicationDisabled());
                if (members.size === 0) return message.channel.send(`Aucun membre n'est actuellement mute.`);
                
                members.forEach(async (member) => {
                    try {
                        await member.timeout(null, 'Unmute général');
                    } catch (err) {
                        console.error(err);
                    }
                });
                
                const embed = new Discord.MessageEmbed()
                    .setColor(couleur)
                    .setTitle('Unmute général')
                    .setDescription(`Tous les membres muets ont été unmute par ${message.author}.`)
                    .setTimestamp()
                    .setFooter(footer);
                
                if (modlogChannel) {
                    const modlog = client.channels.cache.get(modlogChannel);
                    modlog.send({ embeds: [embed] }).catch(() => false);
                }
                
                return message.channel.send(`Tous les membres muets ont été unmute avec succès !`);
            }
            
            // Recherche du membre par mention ou ID
            let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            // Si non trouvé, vérification si le message est une réponse
            if (!target && message.reference) {
                try {
                    const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                    target = repliedMessage.member;
                } catch (err) {
                    console.error("Erreur lors de la récupération du message auquel on répond :", err);
                }
            }
            
            if (!target) {
                return message.channel.send(`Veuillez mentionner un utilisateur valide, fournir un ID valide ou répondre au message de l'utilisateur !`);
            }
            
            var reason = args.slice(1).join(" ") || 'Aucune raison';
            
            try {
                await target.timeout(null, reason);
                
                const embed = new Discord.MessageEmbed()
                    .setColor(couleur)
                    .setTitle('Unmute')
                    .setDescription(`${target} a été unmute par ${message.author}.\nRaison : ${reason}`)
                    .setTimestamp()
                    .setFooter(footer);
                
                if (modlogChannel) {
                    const modlog = client.channels.cache.get(modlogChannel);
                    modlog.send({ embeds: [embed] }).catch(() => false);
                }
                
                return message.channel.send(`${target} a été unmute avec succès !`);
            } catch (err) {
                console.error(err);
                return message.channel.send(`Une erreur s'est produite en essayant de lever le mute de ${target}.`);
            }
        } else {
            return message.channel.send(`Vous n'avez pas les permissions pour utiliser cette commande !`);
        }
    }
};
