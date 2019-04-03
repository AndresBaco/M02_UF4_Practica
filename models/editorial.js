var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EditorialSchema = new Schema({
    name: {type: String, required: true, min: 3, max: 100}
});

// Virtual for this genre instance URL.
EditorialSchema
.virtual('url')
.get(function () {
  return '/catalog/editorial/'+this._id;
});

// Export model.
module.exports = mongoose.model('Editorial', EditorialSchema);