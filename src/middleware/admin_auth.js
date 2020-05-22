const jwt = require('jsonwebtoken')
const Lib_Admin = require('../models/lib_admin')

const admin_auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.SECRET);

    if(!decoded.global){
      throw new Error('NOt Global');
    }

    const admin = await Lib_Admin.findOne({ _id: decoded._id })

    if (!admin) {
      throw new Error('Not Admin')
    }

    req.token = token
    req.user = admin
    next()
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' })
  }
}

module.exports = admin_auth