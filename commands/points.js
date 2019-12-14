const Discord = require('discord.js'); // discord.js module
const Account = require('../util/mongo/account.js'); // account database
const Guild = require('../util/mongo/guildConfig.js'); // guild database

module.exports = {
    name: 'points',
    aliases: ['p', 'point'],
    cooldown: 5,
    async execute(bot, message, args) {

        Guild.findOne({
            guildID: message.guild.id
        }, async(err, guild) => {
            if(err) throw err;
            if(!guild){
                return message.channel.send('🚫 **No configs found! Use `-config`**');
            }else{
                if(!args.length){

                }
            }
        });
        

    }
}

function showMemberPoints(bot, message, Account){
    
    Account.findOne({
        userID: message.author.id
    }, (err, user) => {
        if(err) throw err;
        if(!user){
            return message.channel.send('🚫 **No elo points found!**\nRegister with `-start`');
        }else{
            
        }
    });

}