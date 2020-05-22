const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const libAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"');
      }
    }
  }
});

libAdminSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};

libAdminSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ 
    _id: user._id.toString(),
    global: true
  }, process.env.SECRET);

  return token;
};

libAdminSchema.statics.findByCredentials = async (email, password) => {
  const admin = await Lib_Admin.findOne({ email });

  if (!admin) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return admin;
};

// Hash the plain text password before saving
libAdminSchema.pre('save', async function (next) {
  const admin = this;

  if (admin.isModified('password')) {
    admin.password = await bcrypt.hash(admin.password, 8);
  }

  next();
});

const Lib_Admin = mongoose.model('Lib_Admin', libAdminSchema);

module.exports = Lib_Admin;