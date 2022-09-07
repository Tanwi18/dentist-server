const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const uri = "mongodb+srv://myDestist:goodpassword@cluster0.tawtw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


client.connect(err => {
  const collection = client.db("dentistDb").collection("doctors");
  const doctorsCollection = client.db("dentistDb").collection("members");
  // perform actions on the collection object
  console.log("db connected");

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    console.log(appointment)
    collection.insertOne(appointment)
      .then(result => {
        res.send(result);
        console.log("product added");
      })
  });

  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    console.log(date.date);
    collection.find({ appointmentDate: date.date })
      .toArray((err, document) => {
        res.send(document);
      })
  })

  app.post('/addDoctor', (req, res) => {
    const file = req.files.file;
    const email = req.body.email;
    const name = req.body.name;
    console.log(file, email, name);
    file.mv(`${__dirname}/doctors/${file.name}`, err => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "error occured" });
      }
      doctorsCollection.insertOne({ name, email, img: file.name })
        .then(result => {
          console.log(result);
          res.send(result);
        })
      return res.send({ name: file.name, path: `/${file.name}` });
    })

  })

  app.get("/doctors", (req, res) => {
    doctorsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
});


app.get('/', (req, res) => {
  res.send("hello world");
})

const port = 5000;
app.listen(port);

// to know error
process.on('unhandledRejection', err => {
  console.log(`ERROR: ${err.message}`);
})