const mongoose = require("mongoose");
const db = require("../database.js");

const informacoesSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  idade: {
    type: String,
    required: true,
  },
  dataNascimento: {
    type: String,
  },
  sexo: {
    type: String,
    required: true,
  },
  estadoCivil: {
    type: String,
    required: true,
  },
  curriculo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Curriculo",
    required: true,
  },
});

module.exports = informacoesSchema;
