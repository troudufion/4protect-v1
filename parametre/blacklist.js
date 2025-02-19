const Discord = require("discord.js");
const db = require("quick.db");
const cl = new db.table("Color");
const ownerDB = new db.table("Owner"); // Table pour stocker les owners
const config = require("../config");
const footer = config.bot.footer;

module.exports = {
    name: 'bl',
    usage: 'bl <membre/clear>',
    description: `Permet d'ajouter des membres à la blacklist.`,

    async execute(client, message, args) {
        // Vérifier si l'utilisateur est un "Owner" enregistré ou un "Buyer"
        const isOwner = ownerDB.get(`owners.${message.author.id}`);
        const isBuyer = config.bot.buyer.includes(message.author.id);

        if (isOwner || isBuyer) {
            let color = cl.fetch(`color_${message.guild.id}`);
            if (color == null) color = config.bot.couleur;

            // Commande pour vider la blacklist
            if (args[0] === 'clear') {
                db.delete(`${config.bot.blacklist}.blacklist`);
                return message.channel.send(`✅ La liste noire a été effacée.`);
            }

            // Commande pour ajouter un membre à la blacklist
            if (args[0]) {
                const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

                if (!member) return message.channel.send(`❌ Aucun membre trouvé pour \`${args[0] || "rien"}\``);

                if (db.get(`${config.bot.blacklist}.${member.id}`) === member.id) { 
                    return message.channel.send(`⚠️ **${member.user.username}** est déjà blacklisté.`); 
                }

                db.push(`${config.bot.blacklist}.blacklist`, member.id);
                db.set(`${config.bot.blacklist}.${member.id}`, member.id);

                // Expulsion du membre blacklisté (optionnel)
                try {
                    await member.kick(`Blacklisté par ${message.author.username}`);
                } catch (err) {
                    console.error(err);
                    message.channel.send(`⚠️ Impossible d'expulser **${member.user.username}**.`);
                }

                return message.channel.send(`🔒 <@${member.id}> a été ajouté à la blacklist.`);
            } 
            // Affichage de la liste des utilisateurs blacklistés
            else {
                let blacklistedUsers = db.get(`${config.bot.blacklist}.blacklist`);
                
                let embed = new Discord.MessageEmbed()
                    .setTitle("🔒 Liste des utilisateurs blacklistés")
                    .setColor(color)
                    .setDescription(!blacklistedUsers ? "Aucun utilisateur blacklisté." : blacklistedUsers.map(user => `<@${user}>`).join("\n"))
                    .setFooter({ text: `${footer}` });

                return message.channel.send({ embeds: [embed] });
            }
        } else {
            return message.channel.send(`❌ **Vous n'avez pas la permission d'utiliser cette commande !**`);
        }
    }
};
