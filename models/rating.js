var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var RatingSchema = new Schema({
    bookid: {type: Schema.Types.ObjectId, required: true},
    rating: {type: String, required: true, min: 0, max: 5},
    comment: {type: String, required: false, default:"Sense comentari"}

});

// Virtual for this rating instance URL.
RatingSchema
.virtual('url')
.get(function () {
  return '/catalog/book/'+this._id;
});

// Export model.
module.exports = mongoose.model('Rating', RatingSchema);
