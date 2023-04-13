const mongoose = require('mongoose');

const user = new mongoose.Schema(
  {
    password: { type: String, required: true },
    email:{type: String ,required :true},
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const User = mongoose.model('User', user);

module.exports = User;