const mongoose = require("mongoose");
const db = require("../database.js");

const carreiraSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  timefrom: {
    type: String,
    required: true,
  },
  timeto: {
    type: String,
  },
  position: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  curriculo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Curriculo",
    required: true,
  },
});

module.exports = carreiraSchema;
