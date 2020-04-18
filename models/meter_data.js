const mongoose = require('mongoose')

const MeterDataSchema = mongoose.Schema({
    data_id: mongoose.Schema.Types.ObjectId,
    reading: String,
    meter_id: String,
    timestamp: String
})

module.exports = mongoose.model('MeterData', MeterDataSchema)