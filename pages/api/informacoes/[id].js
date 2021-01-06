const informacoesSchema = require("../../../models/informacoes");
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

let Informacoes;

try {
  // Trying to get the existing model to avoid OverwriteModelError
  Informacoes = mongoose.model("Informacoes");
} catch {
  Informacoes = mongoose.model("Informacoes", informacoesSchema);
}

const getItem = async (query) => {
  try {
    const result = await Informacoes.find({ curriculo: query.id });
    if (result === null) {
      throw { message: "Informacoes not found!" };
    } else return result;
  } catch (err) {
    throw { message: err.message };
  }
};

const patchItem = async (req, res) => {
  let data = {};
  if (req.body.email != null) {
    data.email = req.body.email;
  }

  if (req.body.idade != null) {
    data.idade = req.body.idade;
  }

  if (req.body.dataNascimento != null) {
    data.dataNascimento = req.body.dataNascimento;
  }

  if (req.body.sexo != null) {
    data.sexo = req.body.sexo;
  }

  if (req.body.estadoCivil != null) {
    data.estadoCivil = req.body.estadoCivil;
  }

  if (req.body.curriculo != null) {
    data.curriculo = req.body.curriculo;
  }

  try {
    await Informacoes.findByIdAndUpdate(req.query.id, data);
    const updatedData = await Informacoes.findById(req.query.id);
    return updatedData;
  } catch (err) {
    throw { message: err.message };
  }
};

const deleteItem = async (req, res) => {
  try {
    await Informacoes.findByIdAndDelete(req.query.id);
    return { message: "Informacoes deleted!" };
  } catch (err) {
    throw { message: err.message };
  }
};

export default async (req, res) => {
  await runMiddleware(req, res, cors);
  return new Promise((resolve) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
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
