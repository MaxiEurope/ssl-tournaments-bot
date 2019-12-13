const mongoose = require('mongoose');

const schema = mongoose.Schema({
    guildID: String,
    welcomeMessage: String,
    leaveMessage: String,
    welcomeChannel: String,
    leaveChannel: String,
    welcomeRole: String,
    logChannel: String,
    staffRole: String,
    staff: Array
})

module.exports = mongoose.model('Guild', schema);