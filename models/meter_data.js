const mongoose = require("mongoose");

const MeterDataSchema = mongoose.Schema({
  data_id: mongoose.Schema.Types.ObjectId,
  reading: Number,
  meter_id: Number,
  timestamp: Date,
  type: Number,
});

module.exports = mongoose.model("MeterData", MeterDataSchema);
