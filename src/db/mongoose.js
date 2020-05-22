const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASEURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).then((obj) => {
  console.log('connected to database');
})
  .catch((e) => {
    console.log(e);
  })