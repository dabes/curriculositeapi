const curriculoSchema = require("../../models/curriculo");
const mongoose = require("mongoose");
import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD", "POST", "PATCH", "DELETE"],
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

let Curriculo;

try {
  // Trying to get the existing model to avoid OverwriteModelError
  Curriculo = mongoose.model("Curriculo");
} catch {
  Curriculo = mongoose.model("Curriculo", curriculoSchema);
}

const getItem = async () => {
  try {
    const result = await Curriculo.find();
    if (result === null) {
      throw { message: "Curriculos is empty!" };
    } else return result;
  } catch (err) {
    throw { message: err.message };
  }
};

const postItem = async (req, res) => {
  console.log(req.body);
  const result = new Curriculo({
    name: req.body.name,
    title: req.body.title,
    description: req.body.description,
    facebook: req.body.facebook,
    linkedin: req.body.linkedin,
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
