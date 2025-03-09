@bot.event
async def on_member_join(member):
    # Remplace "NomDuRôle" par le nom exact du rôle que tu veux attribuer
    role = discord.utils.get(member.guild.roles, name="NomDuRôle")
    
    if role:
        await member.add_roles(role)
        print(f"Le rôle {role.name} a été attribué à {member.name}")
