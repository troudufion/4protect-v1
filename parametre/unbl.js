const Discord = require("discord.js");
const db = require("quick.db");
const ownerDB = new db.table("Owner");
const cl = new db.table("Color");
const config = require("../config");
const footer = config.bot.footer;

module.exports = {
    name: 'unbl',
    usage: 'unbl <membre/all>',
    description: `Permet d'enlever un membre ou tous les membres de la blacklist.`,

    async execute(client, message, args) {
        // Vérifier si l'utilisateur a la permission (Owner défini ou Buyer)
        const isOwner = ownerDB.get(`owners.${message.author.id}`);
        const isBuyer = config.bot.buyer.includes(message.author.id);

        if (isOwner || isBuyer) {
            let color = cl.fetch(`color_${message.guild.id}`);
            if (color == null) color = config.bot.couleur;

            // Supprimer toute la blacklist
            if (args[0] === "all") {
                let blacklistedUsers = db.get(`${config.bot.blacklist}.blacklist`);
                if (!blacklistedUsers || blacklistedUsers.length === 0) {
                    return message.channel.send(`⚠️ La blacklist est déjà vide.`);
                }

                db.delete(`${config.bot.blacklist}.blacklist`);
                message.channel.send(` Tous les utilisateurs** ont été retirés de la blacklist.`);
                return;
            }

            // Supprimer un seul utilisateur
            if (args[0]) {
                let member = message.mentions.users.first() || client.users.cache.get(args[0]);

                if (!member) {
                    try {
                        member = await client.users.fetch(args[0]);
                    } catch (e) {
                        return message.channel.send(` Aucun utilisateur trouvé pour \`${args[0] || "rien"}\``);
                    }
                }

                if (!db.get(`${config.bot.blacklist}.${member.id}`)) { 
                    return message.channel.send(` **${member.username}** n'est pas dans la liste noire.`);
                }

                // Supprimer l'utilisateur de la blacklist
                db.set(`${config.bot.blacklist}.blacklist`, db.get(`${config.bot.blacklist}.blacklist`).filter(s => s !== member.id));
                db.delete(`${config.bot.blacklist}.${member.id}`);

                message.channel.send(` **__${member.username}__** a été retiré de la blacklist.`);
            } else {
                return message.channel.send(` **Usage incorrect**. Veuillez mentionner un utilisateur ou utiliser \`unbl all\` pour tout supprimer.`);
            }
        } else {
            return message.channel.send(`Vous n'avez pas la permission d'utiliser cette commande !`);
        }
    }
};
