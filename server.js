const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Server Shutting down.........🔥💥');
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Server Shutting down.........🔥💥');
});

const DB =
  'mongodb+srv://arjunps:eLUwfwLvzFTWT8UB@cluster0.6psjt.mongodb.net/natours?retryWrites=true&w=majority';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection is successfull');
  });

const port = 8000;
app.listen(port, (res, req) => console.log('listening to port 8000'));
