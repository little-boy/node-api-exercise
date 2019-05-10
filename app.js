const express = require('express');
const logger = require('morgan');

const indexRouter = require('./routes/search-flight');

const app = express();

// to configure with an ENV var
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

// send 400 on request errors
// must be improved to be more flexible and correct
app.use(function (err, req, res) {
    // this is written in order to make the API understand
    // express-validation errors
    res.status(400).json(err);
});

module.exports = app;
