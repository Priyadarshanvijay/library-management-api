const express = require('express');
const { loginAdmin } = require('../controllers/admin_controller');

const router = new express.Router();

router.post('/admin/login', loginAdmin);

module.exports = router;