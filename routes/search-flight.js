const express = require('express');
const router = express.Router();
const validate = require('express-validation');

const FlightService = require('../services/flight.service');
const FlightParams = require('../models/flight-params');
const FlightParamsValidation = require('../validations/flight-validation');

/**
 * Search flights across multiple providers and return a standardized json response
 * @Method GET
 * Uri Example :
 * /api/flights?departure_airport=...&arrival_airport=...&departure_date=...&return_date=...&tripType=R|OW
 */
router.get('/api/flights', validate(FlightParamsValidation), function(req, res) {
    const queryParams = req.query;

    // data extraction from query
    const flightParams = new FlightParams(
        queryParams.departure_airport,
        queryParams.arrival_airport,
        queryParams.departure_date,
        queryParams.return_date,
        // seems wrong to mix snake_case and camelCase
        // but i shall respect the specifications.
        queryParams.tripType
    );

    FlightService.handleFlightSearch(flightParams).then((searchResponse) => {
        res.json({...searchResponse, ...{searchDefinition: flightParams}});
    }, err => {
        res.statusCode(500).json(err);
    });
});

module.exports = router;
