module.exports = {
    name: 'ping',
    cooldown: 5,
    async execute(bot, message) {

        /** literally every bot has this command */
        message.channel.send(`🏓 **Pong! \`${Math.round(bot.ping)}\`ms**`);

    }
}