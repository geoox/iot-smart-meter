const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const MeterData = require("../models/meter_data");

router.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "hello",
  });
});

router.post("/new_recording", (req, res, next) => {
  const newRecording = new MeterData({
    reading: req.body.reading,
    meter_id: req.body.meter_id,
    timestamp: req.body.timestamp,
    type: req.body.type,
  });

  newRecording
    .save()
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => res.status(500).json(err));
});

router.get("/data", (req, res, next) => {
  MeterData.find()
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(500).json(err));
});

module.exports = router;
