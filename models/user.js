const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    user_role: {
        type: String,
        enum : ['customer','admin', 'supplier'],
        default: 'customer'
    }
})

module.exports = mongoose.model('User', UserSchema)