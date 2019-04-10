var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RatingSchema = new Schema({
    nota: {type: String, required: true, min: 0, max: 5}
});

// Virtual for this rating instance URL.
RatingSchema
.virtual('url')
.get(function () {
  return '/catalog/rating/'+this._id;
});

// Export model.
module.exports = mongoose.model('Rating', RatingSchema);
