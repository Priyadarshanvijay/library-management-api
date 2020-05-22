const express = require('express');
const admin_auth = require('../middleware/admin_auth');
const auth = require('../middleware/auth');
const { newAuthor, getAllAuthors, getAuthorById } = require('../controllers/author_controller');

const router = new express.Router();

router.post('/author', admin_auth, newAuthor);
router.get('/author', auth, getAllAuthors);
router.get('/author/:id', auth, getAuthorById);

module.exports = router;