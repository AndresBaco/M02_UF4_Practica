var Genre = require('../models/genre');
var Rating = require('../models/rating');
var Book = require('../models/book');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.rating_list = function(req, res, next) {

  Rating.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_ratings) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('rating_list', { title: 'Rating List', rating_list:  list_ratings});
    });

};

// Handle book create on POST.
exports.book_create_post = [

    // Validate fields.
    body('rating', 'Rating must not be empty.').isLength({ min: 1 }).trim(),

  
    // Sanitize fields.
    sanitizeBody('*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var rating = new Rating(
          { rating: req.body.rating,
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
];


// Display detail page for a specific Genre.
exports.rating_book = function(req, res, next) {

    async.parallel({
        rating: function(callback) {

            Rating.findById(req.params.id)
              .exec(callback);
        },

        rating_books: function(callback) {
          Book.find({ 'rating': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.rating==null) { // No results.
            var err = new Error('Rating not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('rating_detail', { title: 'Rating Detail', rating: results.rating, rating_books: results.rating_books } );
    });

};
exports.rating = function(req, res, next) {
    console.log("El param: "+req.param('id'))
    console.log("HEEEEEEEEEY");
};
// Display Genre create form on GET.
exports.rating_create_get = function(req, res, next) {
    res.render('rating_form', { title: 'Create Rating'});

};

// Handle Genre create on POST.
exports.rating_create_post = [
    // Validate that the name field is not empty.
    body('name', 'Rating name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        console.log("El param ess:"+req.params.id);
        console.log("El rating es: "+req.body.rating)
        // Create a genre object with escaped and trimmed data.
        var rating = new Rating(
          { bookid: req.params.id, 
            rating: req.body.rating,
            comment: req.body.comment,
          }
        );

        rating.save(function (err) {
                           if (err) { return next(err); }
                           // Genre saved. Redirect to genre detail page.
                           res.redirect("/catalog/book/"+req.params.id);
                         });
    }
];

// Display Genre delete form on GET.
exports.rating_delete_get = function(req, res, next) {

    async.parallel({
        rating: function(callback) {
            Rating.findById(req.params.id).exec(callback);
        },
        rating_books: function(callback) {
            Book.find({ 'rating': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.rating==null) { // No results.
            res.redirect('/catalog/ratings');
        }
        // Successful, so render.
        res.render('rating_delete', { title: 'Delete rating', rating: results.rating, rating_books: results.rating_books } );
    });

};

// Handle Genre delete on POST.
exports.rating_delete_post = function(req, res, next) {

    async.parallel({
        rating: function(callback) {
            Rating.findById(req.params.id).exec(callback);
        },
        rating_books: function(callback) {
            Book.find({ 'rating': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.rating_books.length > 0) {
            // Genre has books. Render in same way as for GET route.
            res.render('rating_delete', { title: 'Delete Rating', rating: results.rating, rating_books: results.rating_books } );
            return;
        }
        else {
            // Genre has no books. Delete object and redirect to the list of genres.
            Rating.findByIdAndRemove(req.body.id, function deleteRating(err) {
                if (err) { return next(err); }
                // Success - go to genres list.
                res.redirect('/catalog/ratings');
            });

        }
    });

};

// Display Genre update form on GET.
exports.rating_update_get = function(req, res, next) {

    Rating.findById(req.params.id, function(err, rating) {
        if (err) { return next(err); }
        if (rating==null) { // No results.
            var err = new Error('Rating not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('rating_form', { title: 'Update Rating', rating: rating });
    });

};

// Handle Genre update on POST.
exports.rating_update_post = [
   
    // Validate that the name field is not empty.
    body('name', 'Rating name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (escape) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data (and the old id!)
        var rating = new Rating(
          {
          name: req.body.name,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('rating_form', { title: 'Update Rating', rating: rating, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Rating.findByIdAndUpdate(req.params.id, rating, {}, function (err,therating) {
                if (err) { return next(err); }
                   // Successful - redirect to genre detail page.
                   res.redirect(therating.url);
                });
        }
    }
];
