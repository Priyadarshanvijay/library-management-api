const moment = require('moment');
const Book = require('../models/book');
const User = require('../models/user');
const Issue_Request = require('../models/issue_request');

async function newBook(req, res) {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(200).json(book);
  }
  catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

async function getAllBooks(req, res) {
  try {
    const books = await Book.find();
    for (let i = 0; i < books.length; ++i) {
      await books[i].populate('author').execPopulate();
    }
    res.status(200).json(books);
  }
  catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

async function getBookById(req, res) {
  try {
    const _id = req.params.id;
    const book = await Book.findOne({ _id });
    await book.populate('author').execPopulate();
    res.status(200).json(book);
  }
  catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

async function issueBook(req, res) {
  const issue_request_id = req.params.id;
  const approve = req.body.approve;
  try {
    const issue_request = await Issue_Request.findById(issue_request_id);
    const issue_type = issue_request.issueType;   // 1-> Taking to home, 0-> Reading at the library
    if (issue_type === 1) {
      if (moment().utcOffset("+0530").hour() >= 17 || moment().utcOffset("+0530").hour() < 10) {
        throw new Error('Custom: Book can be issued for home only between 10 AM and 5 PM');
      }
    } else {
      if (moment().utcOffset("+0530").hour() >= 15 || moment().utcOffset("+0530").hour() < 10) {
        throw new Error('Custom: Book can be issued for reading only between 10 AM and 3 PM');
      }
    }
    if (approve) {
      const book_to_issue = await Book.findById(issue_request.book);
      const issuer = await User.findById(issue_request.issuer);
      if (issue_type === 1) {
        //To take to home
        const now = moment().utcOffset("+0530").toDate();
        const days_left_in_membership = moment(issuer.validTill).diff(now, 'days');
        if (days_left_in_membership <= 5) {
          throw new Error('Custom: Less than 5 days remaining in membership');
        }
      } else {
        //read here till 5 pm
        const time_till_5pm = 17 - moment().utcOffset("+0530").hour();
        if (issuer.readingHoursRemaining < time_till_5pm) {
          throw new Error('Custom: Not Enough reading hours remaining in membership');
        }
      }
      if (book_to_issue.issued >= book_to_issue.copies) {
        throw new Error('Custom: No more copies left to issue');
      }
      book_to_issue.issued += 1;
      issue_request.issueDate = moment().utcOffset("+0530").toDate();
      issue_request.returnDate = (issue_type === 1) ? moment().utcOffset("+0530").add(7, 'days').toDate() : moment().utcOffset("+0530").add((17 - moment().utcOffset("+0530").hour()), 'hours');
      issue_request.status = 1;    //Approved
      await book_to_issue.save();
      await issue_request.save();
    }
    else {
      issue_request.status = 2;    //Rejected
      await issue_request.save();
    }
    res.status(200).json(issue_request);
  }
  catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

async function issueReq(req, res) {
  try {
    const book_id = req.params.id;
    const user_id = req.user._id;
    const issue_type = req.body.home === true ? 1 : 0;   // 1-> Taking to home, 0-> Reading at the library
    if (issue_type === 1) {
      if (moment().utcOffset("+0530").hour() >= 17 || moment().utcOffset("+0530").hour() < 10) {
        throw new Error('Custom: Book can be issued for home only between 10 AM and 5 PM');
      }
    } else {
      if (moment().utcOffset("+0530").hour() >= 15 || moment().utcOffset("+0530").hour() < 10) {
        throw new Error('Custom: Book can be issued for reading only between 10 AM and 3 PM');
      }
    }
    const issuer = await User.findById(user_id);
    const book_to_issue = await Book.findById(book_id);
    if (issue_type === 1) {
      //To take to home
      const now = moment().utcOffset("+0530").toDate();
      const days_left_in_membership = moment(issuer.validTill).diff(now, 'days');
      if (days_left_in_membership <= 5) {
        throw new Error('Custom: Less than 5 days remaining in membership');
      }
      if (!book_to_issue.forHome) {
        throw new Error('Custom: Book not available to issue for home');
      }
    } else {
      //read here till 5 pm
      const time_till_5pm = 17 - moment().utcOffset("+0530").hour();
      if (issuer.readingHoursRemaining < time_till_5pm) {
        throw new Error('Custom: Not Enough reading hours remaining in membership');
      }
      if (!book_to_issue.forLibrary) {
        throw new Error('Custom: Book not available to issue for library Reading');
      }
    }
    if (book_to_issue.issued >= book_to_issue.copies) {
      throw new Error('Custom: No more copies left to issue');
    }
    const issue_request = new Issue_Request({
      date: moment().utcOffset("+0530").toDate(),
      issuer: user_id,
      book: book_id,
      status: 0,
      issueType: issue_type
    });
    await issue_request.save();
    res.status(200).json(issue_request);
  }
  catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

async function returnReq(req, res) {
  const issue_request_id = req.params.id;
  try {
    if (moment().utcOffset("+0530").hour() >= 17 || moment().utcOffset("+0530").hour() < 10) {
      throw new Error('Custom: Book can be returned only between 10 AM and 5 PM');
    }
    const issue_request = await Issue_Request.findOne({ _id: issue_request_id, issuer: req.user._id, status: 2 });
    issue_request.status = 3;    //Return Requested
    await issue_request.save();
    res.status(200).json(issue_request);
  }
  catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

async function returnBook(req, res) {
  const issue_request_id = req.params.id;
  try {
    if (moment().utcOffset("+0530").hour() >= 17 || moment().utcOffset("+0530").hour() < 10) {
      throw new Error('Custom: Book can be returned only between 10 AM and 5 PM');
    }
    const issue_request = await Issue_Request.findById(issue_request_id);
    const issue_type = issue_request.issueType;
    if (issue_type === 0) {
      const reading_time_in_hrs = moment(issue_request.issueDate).hour() - moment().utcOffset("+0530").hour();
      const user = await User.findById(issue_request.issuer);
      user.readingHoursRemaining -= reading_time_in_hrs;
      await user.save();
    }
    const book_to_issue = await Book.findById(issue_request.book);
    book_to_issue.issued -= 1;
    issue_request.status = 4;    //Returned
    issue_request.returnedOn = moment().utcOffset("+0530").toDate();
    await book_to_issue.save();
    await issue_request.save();
    res.status(200).json(issue_request);
  }
  catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

async function allIssueReq(req, res) {
  try {
    const filter = {};
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
      await issue_requests[i].populate('issuer').populate('book').execPopulate();
    }
    res.json(issue_requests);
  } catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

async function updateBook(req, res) {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'ISBN', 'author', 'copies'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      throw new Error('Custom: Invalid updates!');
    }
    const book_to_update = await Book.findById(req.params.id);
    if (updates.includes('copies') && (book_to_update.issued > req.body.copies)) {
      throw new Error('Custom: More books than the entered value of it\'s Copies have been already issued');
    }
    updates.forEach((update) => book_to_update[update] = req.body[update])
    await book_to_update.save()
    res.json(book_to_update)
  } catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

async function deleteBook(req, res) {
  try {
    const book_to_update = await Book.findById(req.params.id);
    if(book_to_update.issued > 0){
      throw new Error('Custom: Cant delete this book, Some Copies Of it have Already Been Issued');
    }
    await Book.findByIdAndDelete(req.params.id);
    res.json(book_to_update)
  } catch (e) {
    if (e.message.slice(0, 7) === "Custom:") {
      res.status(400).json({ error: e.message });
    }
    else {
      res.status(400).json();
    }
  }
}

module.exports = {
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
}