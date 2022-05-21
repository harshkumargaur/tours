require('dotenv').config();
const app = require('./index');
const mongoose = require('mongoose');
const CustomError = require('./utils/error');
const path = require('path');

const server = app.listen(3000 || process.env.PORT, function(req, res) {
  console.log('listening on port 3000');
});

let n = 0;
const dbConfig = async function() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('conected to network');
  } catch (e) {
    console.log(e.message);
    if (n < 10) {
      dbConfig();
      n++;
    } else {
      server.close(() => {
        console.log('server closed');
        process.exit(1);
      });
    }
  }
};

dbConfig();
n = 0;

mongoose.connection.on('connected',() => console.log('connected'));
mongoose.connection.on('disconnected',() => console.log('disconnected'));
mongoose.connection.on('error',(err) => console.log(err));



process.on('unhandledRejection', (err) => {
  console.log('///////// unhandeledRejection');
  console.log(err.name);
  console.log(err);
});

process.on('uncaughtException', (err) => {
  console.log('uncaughtException');
  console.log(err.message);
  console.log('////////////////');
  console.log(err);
});

// console.log(mongoose.Types.ObjectId('hjgfujyfjkgl'));
// console.log(__dirname);
// console.log(__filename);
// console.log(path.join(__dirname,"views"));
// console.log(path.join(__dirname,"/views"));

// console.log(process);
