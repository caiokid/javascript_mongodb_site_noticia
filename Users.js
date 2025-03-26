var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
   usuario:String,
   senha:String
},{collection:'admin.users'})

var Users = mongoose.model('Users',postSchema);

module.exports = Users;