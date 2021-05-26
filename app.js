require("dotenv").config();

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
  "What is your favorite childhood memory?",
  "What did you and your friends do for fun when you were younger?",
  "What was the best lesson you learned?",
  "What is one piece of technology you think has changed the world for the better?",
  "How do you think the world has changed from when you were my age?",
  "What is something that made you happy this week?",
  "What is your favorite type of show/movie/music?",
  "What are you most proud of?",
];

async function quickstart(file) {
  console.log("Inside quickstart " + file);
  const vision = require("@google-cloud/vision");

  const client = new vision.ImageAnnotatorClient({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY_ID,
    },
    projectId: process.env.PROJECT_ID,
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
  res.render("landing");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/list", (req, res) => {
  res.render("list", { listOfTopics });
});

app.get("/upload", (req, res) => {
  res.render("upload");
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
    quickstart(path).then((data) => res.render("conclusion", { data }));
  });
});

app.get("/test", (req, res) => {
  res.render("landing");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server listening on port 3000")
);
