const Author = require('../models/author');

async function newAuthor(req, res) {
  try {
    const author = new Author(req.body);
    await author.save();
    res.status(200).json(author);
  }
  catch (e) {
    res.status(400).send(e);
  }
}

async function getAllAuthors(req, res) {
  try {
    const authors = await Author.find();
    for(let i = 0 ; i < authors.length ; ++i){
      await authors[i].populate('books').execPopulate();
    }
    res.json(authors);
  }
  catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
}

async function getAuthorById(req, res) {
  try {
    const _id = req.params.id;
    const author = await Author.findOne({ _id });
    await author.populate('books').execPopulate();
    res.json(author);
  }
  catch (e) {
    res.status(400).send(e);
  }
}

module.exports = {
  newAuthor,
  getAllAuthors,
  getAuthorById
}