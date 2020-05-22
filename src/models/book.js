const mongoose = require('mongoose');
const validator = require('validator');

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ISBN: {
    type: String,
    unique: true,
    required: true,
    validate(value) {
      if (!validator.isISBN(value)) {
        throw new Error('ISBN no is invalid');
      }
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  copies: {
    type: Number,
    required: true,
    default: 1
  },
  issued: {
    type: Number,
    required: true,
    default: 0
  },
  forHome: {
    type: Boolean,
    required: true
  },
  forLibrary: {
    type: Boolean,
    required: true
  }
});

// bookSchema.virtual('authors', {
//   ref: 'Author',
//   localField: 'author',
//   foreignField: '_id'
// });

// bookSchema.set('toObject', { virtuals: true });
// bookSchema.set('toJSON', { virtuals: true });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;