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
                    const repliedMessage = await message.channel.messages.fetch(message.re
