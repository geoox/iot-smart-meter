const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    houses_id: Array, // one for customer, more for admin
    user_role: {
        type: String,
        enum : ['customer','admin', 'supplier'],
        default: 'customer'
    }
})

module.exports = mongoose.model('User', UserSchema)