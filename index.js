/**
 * 
 * ShellShock Live tournaments discord bot
 * made by maxi#7777
 * 
 */

require('dotenv').config(); // load the .env file

const Discord = require('discord.js'); // require the discord.js library
/** new Discord Client */
const bot = new Discord.Client({
    disableEveryone: true,
    fetchAllMembers: true
});

/** database */
const mongoose = require('mongoose'); // our database library
/** connect to the database */
mongoose.connect(`mongodb+srv://maxi:${process.env.MONGODB}@cluster0-dqxqq.mongodb.net/test?retryWrites=true&w=majority`, {
    useNewUrlParser: true
});
/** database files */
const Guild = require('./util/mongo/guildConfig.js'); // guild config

/** other useful modules/variables */
const fs = require('fs'); // built in filesystem
const cooldowns = new Discord.Collection(); // command cooldown
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // all command files

bot.commands = new Discord.Collection(); // commands in the bot

/** command files loop */
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log(`${file} successfully loaded!`);
    bot.commands.set(command.name, command);
}

/** first bot event 
 * bot is online
 */
bot.on('ready', () => {
    console.log(`${bot.user.tag} is now online!`);
    bot.user.setActivity(`${bot.users.size} users`, {
        type: 'WATCHING'
    });
});

/** message event */
bot.on('message', async message => {

    if (message.author.bot) return; // the bot shouldn't reply to bots

    /** xp system - probably getting deleted */

    /** arguments, command, cooldown setup */
    const prefix = '-'; // - is the prefix of the bot
    if (!message.content.startsWith(prefix)) return; // stop here, since the message does not start with -

    const args = message.content.slice(prefix.length).split(/ +/); // the message arguments
    const commandName = args.shift().toLowerCase(); // this is the command name, ex.: -help (help is the command name in this case)

    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return; // invalid command

    /** command cooldowns - we don't need spamming users */
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now(); // current timestamp
    const timestamps = cooldowns.get(command.name); // get the cooldown time from the command file
    const cooldownAmount = (command.cooldown || 3) * 1000; // cooldown time - default: 3 seconds

    /** if there's a cooldown - reply to the message author */
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.channel.send(`**${message.author.tag}**, **${timeLeft.toFixed(1)}** s left.`).then(msg => {
                msg.delete(3000);
            });
        }
    }

    /** I (maxi#7777) don't need any cooldowns (developing purpose)  */
    if (message.author.id !== '393096318123245578') {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    /**  finally running the command */
    try {
        command.execute(bot, message, args);
    } catch (err) {
        console.log(err);
    }

});

/** member joined a guild event */
bot.on('guildMemberAdd', async member => {

    const _guild = member.guild; // the guild which the user joined
    if (_guild.id === '650188697022496780') { // if the guilds id is the ssl tournaments one
        Guild.findOne({
            guildID: _guild.id
        }, async (err, guild) => {
            if (err) throw err;
            if (!guild) {
                return; // no guild config found
            } else {
                /** info about the user */
                try {
                    const welcomeUser = new Discord.RichEmbed() // info embed
                        .setAuthor(member.user.tag, member.user.displayAvatarURL)
                        .setDescription(`**${member.user} ${member.user.tag}** joined the server`)
                        .setThumbnail(member.user.displayAvatarURL)
                        .setColor('#00ff00')
                        .setFooter(`ID: ${member.user.id}`)
                        .setTimestamp();
                    bot.channels.get(guild.logChannel).send(welcomeUser); // send the info message
                } catch (error) {
                    console.log(error); // oof, an error occured...
                }
                /** autorole management */
                try {
                    await member.addRole(guild.welcomeRole, `Autorole: ${member.user.tag} joined the server`); // add a role
                    const welcomeRoleSuccess = new Discord.RichEmbed() // role found, no error
                        .setAuthor(member.user.tag, member.user.displayAvatarURL)
                        .setDescription(`**Autorole:** Gave ${member.user} the <@&${guild.welcomeRole}> role!`)
                        .setColor('#00ff00')
                        .setFooter(`ID: ${member.user.id}`)
                        .setTimestamp();
                    bot.channels.get(guild.logChannel).send(welcomeRoleSuccess); // send the log message
                } catch (e) {
                    try {
                        const welcomeRoleError = new Discord.RichEmbed() // missing perms / error
                            .setAuthor(member.user.tag, member.user.displayAvatarURL)
                            .setDescription(`**Error:** Failed to give ${member.user} the <@&${guild.welcomeRole}> role!\n${e.message}`)
                            .setColor('#ff0000')
                            .setFooter(`ID: ${member.user.id}`)
                            .setTimestamp();
                        bot.channels.get(guild.logChannel).send(welcomeRoleError); // send the error to the logs
                    } catch (_e) {
                        console.log(`Log channel not found: ${_e}`); // no #logs channel found
                    }
                }
                /** welcome message management */
                let wChannel;
                try {
                    wChannel = bot.channels.get(guild.welcomeChannel); // the welcome channel
                } catch (e) {
                    return; // no welcome channel found
                }
                if (guild.welcomeMessage === '') return; // welcome message is empty
                let wm = guild.welcomeMessage;
                wm = wm.replace('[user]', member.user).replace('[server]', _guild.name).replace('[members]', _guild.members.size);
                wChannel.send(wm);
            }
        });
    }

});

/** member left a guild event */
bot.on('guildMemberRemove', async member => {

    const _guild = member.guild; // the guild which the user joined
    if (_guild.id === '650188697022496780') { // if the guilds id is the ssl tournaments one
        Guild.findOne({
            guildID: _guild.id
        }, async (err, guild) => {
            if (err) throw err;
            if (!guild) {
                return; // no guild config found
            } else {
                /** info about the user */
                try {
                    const leaveUser = new Discord.RichEmbed() // info embed
                        .setAuthor(member.user.tag, member.user.displayAvatarURL)
                        .setDescription(`**${member.user} ${member.user.tag}** left the server`)
                        .setThumbnail(member.user.displayAvatarURL)
                        .setColor('#000000')
                        .setFooter(`ID: ${member.user.id}`)
                        .setTimestamp();
                    bot.channels.get(guild.logChannel).send(leaveUser); // send the info message
                } catch (error) {
                    console.log(error); // oof, an error occured...
                }
                /** leave message management */
                let lChannel;
                try {
                    lChannel = bot.channels.get(guild.leaveChannel); // the leave channel
                } catch (e) {
                    return; // no leave channel found
                }
                if (guild.leaveMessage === '') return; // leave message is empty
                let lm = guild.leaveMessage;
                lm = lm.replace('[user]', member.user.tag).replace('[server]', _guild.name).replace('[members]', _guild.members.size);
                lChannel.send(lm);
            }
        });
    }

});

bot.login(process.env.TOKEN); // login the bot to the Discord API

/** bot errors */
bot.on('error', err => {
    console.log(err); //catch
});

/** Process uncaughtException event */
process.on('UncaughtException', function (exception) {
    console.log(exception);
});
/** Process UnhandledPromiseRejectionWarning event */
process.on('UnhandledPromiseRejectionWarning', function (RejectionWarning) {
    console.log(RejectionWarning);
});