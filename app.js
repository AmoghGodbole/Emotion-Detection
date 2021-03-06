const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  multer = require("multer"),
  fs = require("fs"),
  Sentiment = require("sentiment");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

async function quickstart(file) {
  console.log("Inside quickstart " + file);
  // Imports the Google Cloud client library
  const vision = require("@google-cloud/vision");

  // Creates a client
  const client = new vision.ImageAnnotatorClient({
    keyFilename: "./apikey.json",
  });

  // Performs label detection on the image file
  // const [result] = await client.labelDetection("./build/images/check3.jpg");
  const [result] = await client.textDetection(file);
  const text = result.fullTextAnnotation.text;
  console.log(text);
  const sentiment = new Sentiment();
  const res = sentiment.analyze(text);
  console.log(res);
  return res;
}

// const Storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, "./Images");
//   },
//   filename: (req, file, callback) => {
//     callback(null, Date.now() + ".jpg");
//   },
// });

// const upload = multer({ dest: "uploads/" });

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
//route
// app.get("/", (req, res) => {
//   res.render("index");
// });

app.get("/", (req, res) => {
  res.render("firstPage");
});

// app.get("/showData", (req, res) => {
//   res.render("firstPage", { data });
// });

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
    console.log(req.file);
    const path = "./images/" + req.file.filename;
    // const finRes = quickstart(path);
    // console.log("FinRes is: " + finRes);
    // res.redirect("/");
    quickstart(path).then((data) => res.render("showData", { data }));
  });
  // res.redirect("/");
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
