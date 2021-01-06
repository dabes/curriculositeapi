const informacoesSchema = require("../../models/informacoes");
const mongoose = require("mongoose");
import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD", "POST", "PATCH", "DELETE"],
  origin: "https://*dabes.com.br",
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

const getItem = async () => {
  try {
    const result = await Informacoes.find();
    if (result === null) {
      throw { message: "Informacoes is empty!" };
    } else return result;
  } catch (err) {
    throw { message: err.message };
  }
};

const postItem = async (req, res) => {
  console.log(req.body);
  const result = new Informacoes({
    email: req.body.email,
    idade: req.body.idade,
    dataNascimento: req.body.dataNascimento,
    sexo: req.body.sexo,
    estadoCivil: req.body.estadoCivil,
    curriculo: req.body.curriculo,
  });
  try {
    const newResult = await result.save();
    return newResult;
  } catch (err) {
    return err.message;
  }
};

export default async (req, res) => {
  await runMiddleware(req, res, cors);
  return new Promise((resolve) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
    switch (req.method) {
      case "POST":
        postItem(req, res)
          .then((response) => {
            res.statusCode = 201;
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
        getItem()
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
