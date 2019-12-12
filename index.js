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

/** other useful modules/variables */
const fs = require('fs'); // built in filesystem
let xpCooldowns = new Set(); // xp only once in a minute
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
    if(!command) return; // invalid command

    /** command cooldowns - we don't need spamming users */
    if(!cooldowns.has(command.name)){
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