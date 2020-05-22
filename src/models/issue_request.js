const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  reqDate:{
    type: Date,
    required: true,
    default: new Date()
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,    
    required: true,
    ref: 'User'
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  issueDate: {
    type: Date
  },
  returnDate: {
    type: Date
  },
  status: {
    type: Number,
    required: true,
    min: 0,
    max: 4,
    default: 0      // 0->opened, 1->Approved, 2->Rejected, 3->ReturnRequested, 4->Returned
  },
  returnedOn: {
    type: Date
  },
  issueType: {
    type: Number,
    required: true,
    min: 0,
    max: 1       // 0-> For Reaing at library, 1-> Taking at home
  }
});

const Issue_Request = mongoose.model('Issue_Request', requestSchema);

module.exports = Issue_Request;