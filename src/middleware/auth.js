const jwt = require('jsonwebtoken')
const User = require('../models/user')
const admin_auth = require('./admin_auth')


const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.SECRET)
    const user = await User.findOne({ _id: decoded._id })

    if (!user) {
      admin_auth(req, res, next);
    }
    else {
      req.token = token
      req.user = user
      next()
    }
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' })
  }
}

module.exports = auth