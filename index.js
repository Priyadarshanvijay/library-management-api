const express = require('express');
const cors = require('cors');
require('dotenv').config()
require('./src/db/mongoose');
const userRouter = require('./src/routes/user');
const authorRouter = require('./src/routes/author');
const bookRouter = require('./src/routes/book');
const adminRouter = require('./src/routes/admin');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(authorRouter);
app.use(bookRouter);
app.use(adminRouter);


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})
