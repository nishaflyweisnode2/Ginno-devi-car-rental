const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const app = express();
const path = require("path");
const { MongoClient } = require('mongodb');

app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV == "production") {
    console.log = function () { };
}
app.get("/", (req, res) => {
    res.send("Hello Ginno Car Rental Project!");
});

require('./routes/userRoute')(app);
require('./routes/adminRoute')(app);
require('./routes/partnerRoute')(app);



mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);

mongoose.connect(process.env.DB_URL, /*{ useNewUrlParser: false, useUnifiedTopology: false, }*/).then((data) => {
    console.log(`Ginno Devi Car Rental Mongodb Connected With Server: ${data.connection.host}`);
});

// const pemFilePath1 = path.resolve(__dirname, 'global-bundle.pem');
// console.log('Resolved path to global-bundle.pem:', pemFilePath1);
// const pemFilePath = 'D:/Project/Ginno-devi-car-rental.git/global-bundle.pem';
// const fs = require('fs');
// fs.readFile(pemFilePath, 'utf8', (err, data) => {
//     if (err) {
//         console.error('Error reading TLS certificate file:', err);
//         return;
//     }
//     // console.log('TLS certificate file contents:', data);
// });

// const awsDocumentDBConnectionString = `mongodb://documentdb:RomoNGtionmalati@docdb-dev-cluster2.cpw80w2kym5e.us-east-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem&retryWrites=false`;

// //Create a MongoDB client, open a connection to DocDB; as a replica set,
// //  and specify the read preference as secondary preferred

// // var client = MongoClient.connect(
// //     'mongodb://documentdb:RomoNGtionmalati@docdb-dev-cluster2.cpw80w2kym5e.us-east-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem&retryWrites=false',
// //     {
// //         tlsCAFile: pemFilePath1 //Specify the DocDB; cert
// //     },
// //     function (err, client) {
// //         if (err)
// //             throw err;

// //         db = client.db('sample-database');

// //         col = db.collection('sample-collection');

// //         col.insertOne({ 'hello': 'Amazon DocumentDB' }, function (err, result) {
// //             col.findOne({ 'hello': 'DocDB;' }, function (err, result) {
// //                 console.log(result);

// //                 client.close()
// //             });
// //         });
// //     });

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}!`);
});

module.exports = app;
module.exports.handler = serverless(app)