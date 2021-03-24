const express = require("express"),
  app = express(),
  multer = require("multer"),
  fs = require("fs"),
  Sentiment = require("sentiment");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

const listOfTopics = [
  "Topic 1",
  "Topic 2",
  "Topic 3",
  "Topic 4",
  "Topic 5",
  "Topic 6",
  "Topic 7",
  "Topic 8",
];

async function quickstart(file) {
  console.log("Inside quickstart " + file);
  const vision = require("@google-cloud/vision");

  const client = new vision.ImageAnnotatorClient({
    keyFilename: "./apikey.json",
  });

  const [result] = await client.textDetection(file);
  const text = result.fullTextAnnotation.text;
  console.log(text);
  const sentiment = new Sentiment();
  const res = sentiment.analyze(text);
  console.log(res);
  return res;
}

const Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, __dirname + "/images");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({
  storage: Storage,
}).single("image");

app.get("/", (req, res) => {
  res.render("index", { listOfTopics });
});

app.get("/upload", (req, res) => {
  res.render("firstPage");
});

app.get("/conclusion/:data", (req, res) => {
  const { data } = req.params;
  const sentiment = new Sentiment();
  const result = sentiment.analyze(data);
  console.log(result);
  res.render("conclusion", { data: result });
});

app.get("/listen", (req, res) => {
  res.render("listen");
});

app.post("/listen/:data", (req, res) => {
  return res.redirect(200, "/conclusion/:data");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.send("Something went wrong");
    }

    const image = fs.readFileSync(
      __dirname + "/images/" + req.file.originalname,
      {
        encoding: null,
      }
    );
    console.log(image);
    const path = "./images/" + req.file.filename;
    quickstart(path).then((data) => res.render("showData", { data }));
  });
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server listening on port 3000")
);

// READ THIS AND IMPLEMENT IT
// https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088#:~:text=When%20a%20web%20client%20uploads,middleware%20for%20Express%20and%20Node.
// https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/

// Check this as well, where fs is used and it reads multer images
// Here it seems like the files are being saved in JPG format. Check on how to do that
// https://www.youtube.com/watch?v=1DtyAOHEHJY&t=453s

// https://www.freecodecamp.org/news/speech-to-sentiment-with-chrome-and-nodejs/
// If the above link isn't satisfying, try and use this package:
// https://www.npmjs.com/package/@google-cloud/speech
// Implementation using google-cloud-speech: https://www.youtube.com/watch?v=naZ8oEKuR44
