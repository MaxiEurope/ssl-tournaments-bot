const Discord = require('discord.js'); // discord.js module
const Guild = require('../util/mongo/guildConfig.js'); // guild config

module.exports = {
    name: 'config',
    cooldown: 5,
    async execute(bot, message, args) {

        Guild.findOne({
            guildID: message.guild.id
        }, async (err, guild) => {
            if (err) throw err;
            if (!guild) { // no guild database => going to create one
                const newGuild = new Guild({
                    guildID: message.guild.id,
                    welcomeMessage: '',
                    leaveMessage: '',
                    welcomeChannel: '',
                    leaveChannel: '',
                    welcomeRole: '',
                    logChannel: '',
                    staffRole: '',
                    staff: []
                });
                newGuild.save().catch(e => console.log(e));
                return message.channel.send('✅ **Setup complete!**');
            } else { // we found the guilds database

                if (message.author.id !== '393096318123245578' || !guild.staff.includes(message.author.id)) return; // stop here if the user isn't maxi#7777 or one of the staff members

                if (!args.length) { // no arguments given
                    configMessage(guild, bot, message, Discord);
                } else {
                    /** the mess begins.. */
                    let type = args[0].toLowerCase();

                    if (type === 'wchannel') {
                        let new_wchannel = message.mentions.channels.first();
                        if (!new_wchannel) {
                            return message.channel.send('🚫 **Invalid channel mention** - use `-config wchannel #welcome` for example');
                        } else {
                            guild.welcomeChannel = new_wchannel.id;
                            guild.save().catch(e => console.log(e));
                            return message.channel.send(`✅ **Successfully set welcome channel to: ${new_wchannel}**`);
                        }
                    } else if (type === 'lchannel') {
                        let new_lchannel = message.mentions.channels.first();
                        if (!new_lchannel) {
                            return message.channel.send('🚫 **Invalid channel mention** - use `-config lchannel #welcome` for example');
                        } else {
                            guild.leaveChannel = new_lchannel.id;
                            guild.save().catch(e => console.log(e));
                            return message.channel.send(`✅ **Successfully set leave channel to: ${new_lchannel}**`);
                        }
                    } else if (type === 'role') {
                        let new_role = args[1];
                        if (!new_role) {
                            return message.channel.send('🚫 **Missing role ID** - use `-config role 1472895634856948` for example');
                        } else {
                            if (!message.guild.roles.get(new_role)) {
                                return message.channel.send('🚫 **Invalid role ID**');
                            } else {
                                guild.welcomeRole = new_role;
                                guild.save().catch(e => console.log(e));
                                return message.channel.send(`✅ **Successfully set role to: ${message.guild.roles.get(new_role).name}**`);
                            }
                        }
                    } else if (type === 'logs') {
                        let new_logs = message.mentions.channels.first();
                        if (!new_logs) {
                            return message.channel.send('🚫 **Invalid channel mention** - use `-config logs #logs` for example');
                        } else {
                            guild.logChannel = new_logs.id;
                            guild.save().catch(e => console.log(e));
                            return message.channel.send(`✅ **Successfully set logs channel to: ${new_logs}**`);
                        }
                    } else if (type === 'staffrole') {
                        let new_staffRole = args[1];
                        if (!new_staffRole) {
                            return message.channel.send('🚫 **Missing role ID** - use `-config staffrole 1472895634856948` for example');
                        } else {
                            if (!message.guild.roles.get(new_staffRole)) {
                                return message.channel.send('🚫 **Invalid role ID**');
                            } else {
                                guild.staffRole = new_staffRole;
                                guild.save().catch(e => console.log(e));
                                return message.channel.send(`✅ **Successfully set staff role to: ${message.guild.roles.get(new_staffRole).name}**`);
                            }
                        }
                    } else if (type === 'staff') {
                        if (guild.staff.length === 0) {
                            return infoStaff(message, guild, bot)
                        }
                        let method = args[1].toLowerCase();
                        if(!method) return infoStaff(message, guild, bot);
                        if(method === 'add'){
                            let id = args[2];
                            if(!id) return message.channel.send('🚫 **Missing user ID** - user `-config staff add 393096318123245578` for example');
                            if(guild.staff.indexOf(id) > -1) return message.channel.send('🚫 **User is already staff!**');
                            let user = '';
                            try {
                                user = bot.users.get(id).tag;
                            } catch (e) {
                                return message.channel.send('🚫 **Invalid user ID - user not found**');
                            }
                            guild.staff.push(id);
                            guild.save().catch(e => console.log(e));
                            return message.channel.send(`✅ **Successfully added ${user} to staff list**`);
                        }else if(method === 'remove'){
                            let id = args[2];
                            if(!id) return message.channel.send('🚫 **Missing user ID** - user `-config staff remove 393096318123245578` for example');
                            if(guild.staff.indexOf(id) === -1) return message.channel.send('🚫 **User is not staff!**');
                            let user = '';
                            try {
                                user = bot.users.get(id).tag;
                            } catch (e) {
                                return message.channel.send('🚫 **Invalid user ID - user not found**');
                            }
                            guild.staff.splice(guild.staff.indexOf(id), 1);
                            guild.save().catch(e => console.log(e));
                            return message.channel.send(`✅ **Successfully removed ${user} from staff list**`);
                        }else{
                            return infoStaff(message, guild, bot);
                        }
                    }
                }

            }
        });

    }
}

function configMessage(guild, bot, message, Discord) {

    const embed = new Discord.RichEmbed()
        .setAuthor('Server config', bot.user.displayAvatarURL)
    let welcome_channel = guild.welcomeChannel !== '' ? `<#${guild.welcomeChannel}> - you can change the welcome channel with: \`-config wchannel #channel\`` : 'set a welcome channel with: `-config wchannel #channel`';
    let leave_channel = guild.leaveChannel !== '' ? `<#${guild.leaveChannel}> - you can change the leave channel with: \`-config lchannel #channel\`` : 'set a leave channel with: `-config lchannel #channel`';
    embed.addField('Welcome channel', welcome_channel, true);
    embed.addField('Leave channel', leave_channel, true);
    /** welcome role */
    let welcome_role = guild.welcomeRole !== '' ? `<@&${guild.welcomeRole}> - you can change the role which will be added on user join with: \`-config role ID\`` : 'set a role which will be added when a user joins this server with: `-config role ID`';
    embed.addField('Role added on user join', welcome_role);
    let log_channel = guild.logChannel !== '' ? `<#${guild.logChannel}> - you can change the logs channel with: \`-config logs #channel\`` : 'set the log channel with: `-config logs #channel`';
    embed.addField('Logs channel', log_channel);
    let staff_role = guild.staffRole !== '' ? `<@&${guild.staffRole}> - you can change the staff role with: \`-config staffrole ID\`` : 'set the staff role with: `-config staffrole ID`';
    embed.addField('Staff role', staff_role);
    let staff = '';
    if (guild.staff.length !== 0) {
        for (let i = 0; i < guild.staff.length; i++) {
            staff += `<@${guild.staff[i]}> `;
        }
    } else {
        staff = 'No staff found - use `-config staff`';
    }
    embed.addField('Staff', staff)
        .addField('Welcome/Leave message', 'set the messages with: `-config join` and `-config leave`')
        .setColor('#00ff00')
        .setTimestamp();
    message.channel.send(embed);

}

function infoStaff(message, guild, bot) {
    let staff = '';
    if (guild.staff.length !== 0) {
        for (let i = 0; i < guild.staff.length; i++) {
            staff += `${bot.users.get(guild.staff[i]).tag} `;
        }
    } else {
        staff = 'No staff found';
    }
    return message.channel.send(`🛠️ **Current staff:** ${staff}\n` +
        'ℹ️ `-config staff add ID` / `-config staff remove ID`');
}