var Editorial = require('../models/editorial');
var Book = require('../models/book');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.editorial_list = function(req, res, next) {

  Editorial.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_editorials) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('editorial_list', { title: 'Editorial List', editorial_list:  list_editorials});
    });

};

// Display detail page for a specific Genre.
exports.editorial_detail = function(req, res, next) {

    async.parallel({
        editorial: function(callback) {

            Editorial.findById(req.params.id)
              .exec(callback);
        },

        editorial_books: function(callback) {
          Book.find({ 'editorial': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.editorial==null) { // No results.
            var err = new Error('editorial not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('editorial_detail', { title: 'Editorial Detail', editorial: results.editorial, editorial_books: results.editorial_books } );
    });

};

// Display Genre create form on GET.
exports.editorial_create_get = function(req, res, next) {
    res.render('editorial_form', { title: 'Create Editorial'});
};

// Handle Genre create on POST.
exports.editorial_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Editorial name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var editorial = new Editorial(
          { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('editorial_form', { title: 'Create Editorial', editorial: editorial, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Editorial.findOne({ 'name': req.body.name })
                .exec( function(err, found_editorial) {
                     if (err) { return next(err); }

                     if (found_editorial) {
                         // Genre exists, redirect to its detail page.
                         res.redirect(found_editorial.url);
                     }
                     else {

                         editorial.save(function (err) {
                           if (err) { return next(err); }
                           // Genre saved. Redirect to genre detail page.
                           res.redirect(editorial.url);
                         });

                     }

                 });
        }
    }
];

// Display Genre delete form on GET.
exports.editorial_delete_get = function(req, res, next) {

    async.parallel({
        editorial: function(callback) {
            Editorial.findById(req.params.id).exec(callback);
        },
        editorial_books: function(callback) {
            Editorial.find({ 'editorial': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.editorial==null) { // No results.
            res.redirect('/catalog/editorials');
        }
        // Successful, so render.
        res.render('editorial_delete', { title: 'Delete Editorial', editorial: results.editorial, editorial_books: results.editorial_books } );
    });

};

// Handle Genre delete on POST.
exports.editorial_delete_post = function(req, res, next) {

    async.parallel({
        editorial: function(callback) {
            Editorial.findById(req.params.id).exec(callback);
        },
        editorial_books: function(callback) {
            Editorial.find({ 'editorial': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.editorial_books.length > 0) {
            // Genre has books. Render in same way as for GET route.
            res.render('editorial_delete', { title: 'Delete Editorial', editorial: results.editorial, editorial_books: results.editorial_books } );
            return;
        }
        else {
            // Genre has no books. Delete object and redirect to the list of genres.
            Editorial.findByIdAndRemove(req.body.id, function deleteEditorial(err) {
                if (err) { return next(err); }
                // Success - go to genres list.
                res.redirect('/catalog/editorials');
            });

        }
    });

};

// Display Genre update form on GET.
exports.editorial_update_get = function(req, res, next) {

    Editorial.findById(req.params.id, function(err, editorial) {
        if (err) { return next(err); }
        if (editorial==null) { // No results.
            var err = new Error('editorial not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('editorial_form', { title: 'Update Editorial', editorial: editorial });
    });

};

// Handle Genre update on POST.
exports.editorial_update_post = [
   
    // Validate that the name field is not empty.
    body('name', 'editorial name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (escape) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data (and the old id!)
        var editorial = new Editorial(
          {
          name: req.body.name,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('editorial_form', { title: 'Update Editorial', editorial: editorial, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Editorial.findByIdAndUpdate(req.params.id, editorial, {}, function (err,theeditorial) {
                if (err) { return next(err); }
                   // Successful - redirect to genre detail page.
                   res.redirect(theeditorial.url);
                });
        }
    }
];
