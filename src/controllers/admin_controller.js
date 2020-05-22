const LibAdmin = require('../models/lib_admin');

async function loginAdmin(req, res) {
  try {
    const admin = await LibAdmin.findByCredentials(req.body.email, req.body.password);
    const token = await admin.generateAuthToken();
    res.json({ admin, token });
  } catch (e) {
    res.status(400).send();
  }
};

module.exports = {
  loginAdmin
}