const mongoose = require('mongoose');

const schema = mongoose.Schema({
    guildID: String,
    welcomeBoolean: Boolean,
    leaveBoolean: Boolean,
    welcomeMessage: String,
    leaveMessage: String,
    welcomeChannel: String,
    leaveChannel: String,
    welcomeRoleBoolean: Boolean,
    welcomeRole: String,
    logChannel: String
})

module.exports = mongoose.model('Guild', schema);