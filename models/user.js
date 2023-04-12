const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    password: { type: String, required: true },
    email:{type: String ,required :true},
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;