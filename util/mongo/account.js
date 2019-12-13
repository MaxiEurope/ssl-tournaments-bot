const mongoose = require('mongoose');

const schema = mongoose.Schema({
    userID: String,
    elo: Number,
    steamAccount: String
})

module.exports = mongoose.model('Account', schema);