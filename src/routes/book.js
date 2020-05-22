const express = require('express');
const admin_auth = require('../middleware/admin_auth');
const auth = require('../middleware/auth');
const { 
  newBook,
  getAllBooks, 
  getBookById, 
  issueBook, 
  issueReq, 
  returnReq, 
  returnBook, 
  allIssueReq, 
  updateBook, 
  deleteBook 
} = require('../controllers/book_controller');

const router = new express.Router();

router.post('/book', admin_auth, newBook);
router.get('/book', auth, getAllBooks);
router.get('/book/issuereq', admin_auth, allIssueReq);
router.get('/book/:id', auth, getBookById);
router.patch('/book/:id', admin_auth, updateBook);
router.delete('/book/:id', admin_auth, deleteBook);
router.patch('/book/:id/issue', admin_auth, issueBook);
router.post('/book/:id/issuereq', auth, issueReq);
router.post('/book/:id/returnreq', auth, returnReq);
router.patch('/book/:id/return', admin_auth, returnBook);

module.exports = router;