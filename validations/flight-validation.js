const Joi = require('joi');

// date format YYYY-MM-DD
const basicDateValidation = Joi.string().regex(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/);

// we need to have a better validation here
// to check if :
// - departure_date is before return_daten
// - return_date is required only if tripType is "R",
// - a better validation of airports.
module.exports = {
    query: {
        departure_airport: Joi.string().required(),
        arrival_airport: Joi.string().required(),
        departure_date: basicDateValidation.required(),
        return_date: basicDateValidation,
        tripType: Joi.string().regex(/^(R|OW)$/).required()
    }
};
