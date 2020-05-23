const User = require('../models/user');
const Issue_Request = require('../models/issue_request');
const moment = require('moment');

async function loginUser(req, res) {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.json({ user, token });
  } catch (e) {
    res.status(400).send();
  }
};

async function getSelf(req, res) {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (e) {
    res.status(400).send();
  }
}

async function registerUser(req, res) {
  const user = new User(req.body);
  const noOfDays = req.body.noOfDays;
  const readingHoursAlloted = req.body.readingHours;
  try {
    user.validFrom = moment().utcOffset("+0530").toDate();
    user.validTill = moment().utcOffset("+0530").add(noOfDays, 'days').toDate();
    user.readingHoursRemaining = readingHoursAlloted;
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

async function getIssuedHistory(req, res) {
  try {
    const filter = {
      issuer: req.user._id
    };
    if ((typeof req.query.issued !== 'undefined') && (req.query.issued === 'true')) {
      filter.status = { $in: [1, 3] }
    } else if ((typeof req.query.rejected !== 'undefined') && (req.query.rejected === 'true')) {
      filter.status = 2
    } else if ((typeof req.query.returned !== 'undefined') && (req.query.returned === 'true')) {
      filter.status = 4
    } else if ((typeof req.query.issue_pending !== 'undefined') && (req.query.issue_pending === 'true')) {
      filter.status = 0
    } else if ((typeof req.query.return_pending !== 'undefined') && (req.query.return_pending === 'true')) {
      filter.status = 3
    }
    const issue_requests = await Issue_Request.find(filter);
    for (let i = 0; i < issue_requests.length; ++i) {
      await issue_requests[i].populate('book').execPopulate();
    }
    res.json(issue_requests);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function deleteIssuedHistory(req, res) {
  try {
    const req_id = req.params.id;
    const issuer_id = req.user._id;
    const issued_request = await Issue_Request.findOne({ _id: req_id, issuer: issuer_id });
    if (!issued_request) {
      throw new Error('No Such Request Found');
    }
    if (issued_request.status === 3 || issued_request.status === 1) {
      throw new Error('Cannot Delete Currently Issued books history');
    }
    const deleted_request = await Issue_Request.findOneAndDelete({ _id: req_id, issuer: issuer_id });
    res.json(deleted_request);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
}

async function updateSelf(req, res) {
  try {
    const user = req.user;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
      throw new Error('Invalid updates!');
    }
    updates.forEach((update) => user[update] = req.body[update]);
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'validTill', 'readingHoursRemaining'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
      throw new Error('Invalid updates!');
    }
    updates.forEach((update) => user[update] = req.body[update]);
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
}

module.exports = {
  loginUser,
  registerUser,
  getIssuedHistory,
  deleteIssuedHistory,
  updateSelf,
  updateUser,
  getSelf
}