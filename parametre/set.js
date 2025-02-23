const Discord = require("discord.js");
const db = require("quick.db");
const ownerDB = new db.table("Owner");
const config = require("../config");

module.exports = {
    name: 'set',
    usage: 'set <name/pic/banner> [nom/lien]',
    description: `Permet de changer le nom, l'avatar ou la bannière du bot.`,
    
    async execute(client, message, args) {
        // Vérifier si l'utilisateur est Owner ou Buyer
        const isOwner = ownerDB.get(`owners.${message.author.id}`);
        const isBuyer = config.bot.buyer.includes(message.author.id);

        if (isOwner || isBuyer) {
            if (args.length >= 2) {
                const option = args[0].toLowerCase();
                const content = args.slice(1).join(" ");

                switch (option) {
                    case 'name':
                        client.user.setUsername(content)
                            .then(() => message.channel.send(` **Nom du bot modifié avec succès !**`))
                            .catch(() => message.reply(`⚠ Veuillez patienter avant de rechanger mon pseudo.`));
                        break;

                    case 'pic':
                        if (message.attachments.size > 0) {
                            const attachment = message.attachments.first();
                            client.user.setAvatar(attachment.url)
                                .then(() => message.channel.send(` **Photo de profil du bot mise à jour !**`))
                                .catch(() => message.reply(`⚠ Veuillez patienter avant de rechanger mon avatar.`));
                        } else {
                            client.user.setAvatar(content)
                                .then(() => message.channel.send(` **Photo de profil du bot mise à jour !**`))
                                .catch(() => message.reply(`⚠ Veuillez patienter avant de rechanger mon avatar.`));
                        }
                        break;

                    case 'banner':
                        if (!client.user.banner) {
                            return message.reply(` Impossible de changer la bannière** : seuls les **bots vérifiés et boostés avec Nitro peuvent avoir une bannière.`);
                        }
                        if (message.attachments.size > 0) {
                            const attachment = message.attachments.first();
                            client.user.setBanner(attachment.url)
                                .then(() => message.channel.send(` **Bannière du bot mise à jour !**`))
                                .catch(() => message.reply(`⚠ Une erreur s'est produite, veuillez vérifier que l'image est bien valide.`));
                        } else {
                            client.user.setBanner(content)
                                .then(() => message.channel.send(` **Bannière du bot mise à jour !**`))
                                .catch(() => message.reply(`⚠ Une erreur s'est produite, veuillez vérifier que l'image est bien valide.`));
                        }
                        break;

                    default:
                        message.reply(` Option invalide. Veuillez choisir parmi: **name, pic, banner**.`);
                        break;
                }
            } else {
                message.reply(` Veuillez fournir une option (**name, pic, banner**) suivie du contenu (**nom ou lien**).`);
            }
        } else {
            message.reply(` Vous n'avez pas la permission d'utiliser cette commande !`);
        }
    }
};
