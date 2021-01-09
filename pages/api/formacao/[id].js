const formacaoSchema = require("../../../models/formacao");
const mongoose = require("mongoose");
import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD", "POST", "PATCH", "DELETE"],
  origin: process.env.ORIGIN,
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};

let Formacao;

try {
  // Trying to get the existing model to avoid OverwriteModelError
  Formacao = mongoose.model("Formacao");
} catch {
  Formacao = mongoose.model("Formacao", formacaoSchema);
}

const getItem = async (query) => {
  try {
    const result = await Formacao.find({ curriculo: query.id });
    if (result === null) {
      throw { message: "Formacao not found!" };
    } else return result;
  } catch (err) {
    throw { message: err.message };
  }
};

const patchItem = async (req, res) => {
  let data = {};
  if (req.body.curso != null) {
    data.curso = req.body.curso;
  }

  if (req.body.grau != null) {
    data.grau = req.body.grau;
  }

  if (req.body.instituicao != null) {
    data.instituicao = req.body.instituicao;
  }

  if (req.body.inicio != null) {
    data.inicio = req.body.inicio;
  }

  if (req.body.estado != null) {
    data.estado = req.body.estado;
  }

  if (req.body.curriculo != null) {
    data.curriculo = req.body.curriculo;
  }

  try {
    await Formacao.findByIdAndUpdate(req.query.id, data);
    const updatedData = await Formacao.findById(req.query.id);
    return updatedData;
  } catch (err) {
    throw { message: err.message };
  }
};

const deleteItem = async (req, res) => {
  try {
    await Formacao.findByIdAndDelete(req.query.id);
    return { message: "Formacao deleted!" };
  } catch (err) {
    throw { message: err.message };
  }
};

export default async (req, res) => {
  await runMiddleware(req, res, cors);
  return new Promise((resolve) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Cache-Control",
      "s-max-age=immutable, stale-while-revalidate"
    );
    switch (req.method) {
      case "PATCH":
        patchItem(req, res)
          .then((response) => {
            res.statusCode = 200;
            res.end(JSON.stringify(response));
            return resolve();
          })
          .catch((error) => {
            res.statusCode = 500;
            res.json(error);
            res.end();
            return resolve(); //in case something goes wrong in the catch block (as vijay) commented
          });
        break;
      case "DELETE":
        deleteItem(req, res)
          .then((response) => {
            res.statusCode = 200;
            res.end(JSON.stringify(response));
            return resolve();
          })
          .catch((error) => {
            res.statusCode = 500;
            res.json(error);
            res.end();
            return resolve(); //in case something goes wrong in the catch block (as vijay) commented
          });
        break;
      case "GET":
        // GET
        getItem(req.query)
          .then((response) => {
            res.statusCode = 200;
            res.end(JSON.stringify(response));
            return resolve();
          })
          .catch((error) => {
            res.statusCode = 500;
            res.json(error);
            res.end();
            return resolve(); //in case something goes wrong in the catch block (as vijay) commented
          });
        break;
      default:
        res.statusCode = 405;
        res.json({ message: req.method + " not allowed!" });
        res.end();
        return resolve();
    }
  });
};
