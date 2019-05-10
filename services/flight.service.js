const Q = require('q');
const async = require('async');
const _ = require('lodash');

// we store here the list of providers code but this could be
// a dynamic set of strategies listed thanks to fs. But we should
// be careful on performances. Listing here an array might be better
// than having a directory access on each request
const PROVIDERS = [
    'jazz',
    'moon'
];

class FlightService {
    /**
     * Proxy returning different promise following tripType
     *
     * @param flightParams
     * @return {*}
     */
    handleFlightSearch (flightParams) {
        // if RoundTrip
        if (flightParams.tripType === 'R') {
            return this.handleFlightSearchRoundTrip(flightParams);
            // if one way trip
        } else if (flightParams.tripType === 'OW') {
            return this.handleFlightSearchOneWayTrip(flightParams);
        }

        throw new Error('Invalid trip type');
    }

    /**
     * Handle the flights search for a one way trip
     *
     * @todo the response should be normalized
     * @todo we might consider refactoring some code with handleFlightSearchRoundTrip
     *
     * @param flightParams
     * @return {Promise<Cancel> | Promise<any>}
     */
    handleFlightSearchOneWayTrip (flightParams) {
        var deferred = Q.defer();

        const roundTripCallbacks = {
            goings: (callback) => {
                this.searchFlights(flightParams.getGoing())
                    .then((flights) => callback(null, flights), err => callback(err));
            }
        };

        async.parallel(roundTripCallbacks, (err, roundTripFlights) => {
            if (err) {
                deferred.reject(err);
            } else {
                try {
                    // formatting
                    roundTripFlights = this.formatFlightIdsAsKeys(roundTripFlights);

                    // price combinations
                    const priceCombinations = this.combineOneWayTripPrices(roundTripFlights);

                    deferred.resolve({
                        flights: roundTripFlights,
                        priceCombinations: priceCombinations
                    });
                } catch (e) {
                    deferred.reject(e);
                }
            }
        });

        return deferred.promise;
    }

    /**
     * Handle the flights search for a round trip
     *
     * @param flightParams
     * @return Promise
     */
    handleFlightSearchRoundTrip (flightParams) {
        var deferred = Q.defer();

        const roundTripCallbacks = {
            goings: (callback) => {
                this.searchFlights(flightParams.getGoing())
                    .then((flights) => callback(null, flights), err => callback(err));
            },
            comings: (callback) => {
                this.searchFlights(flightParams.getComing())
                    .then((flights) => callback(null, flights), err => callback(err));
            }
        };

        async.parallel(roundTripCallbacks, (err, roundTripFlights) => {
            if (err) {
                deferred.reject(err);
            } else {
                try {
                    // formatting
                    roundTripFlights = this.formatFlightIdsAsKeys(roundTripFlights);

                    // going / coming combinations
                    const tripCombinations = this.combineRoundTripFlights(flightParams, roundTripFlights);

                    // price combinations
                    const priceCombinations = this.combineTripsByPrice(roundTripFlights, tripCombinations);

                    deferred.resolve({
                        flights: roundTripFlights,
                        priceCombinations: priceCombinations
                    });
                } catch (e) {
                    deferred.reject(e);
                }
            }
        });

        return deferred.promise;
    }

    /**
     * Combine round trips by price
     *
     * @param roundTripFlights
     * @param tripCombinations
     */
    combineTripsByPrice (roundTripFlights, tripCombinations) {
        // the key is the price
        const priceCombinations = {};

        _.each(tripCombinations, (combination) => {
            const combinationPrice = roundTripFlights.goings[combination[0]].price +
                roundTripFlights.comings[combination[1]].price;

            if (priceCombinations[combinationPrice] === undefined) {
                priceCombinations[combinationPrice] = [];
            }

            priceCombinations[combinationPrice].push(combination);
        });

        return priceCombinations;
    }

    /**
     * Format flights as an object with goings and comings
     * The flights are indexed by key so that simplify the search and combinations
     *
     * @param roundTripFlights
     * @return {{goings: Object}}
     */
    formatFlightIdsAsKeys (roundTripFlights) {
        // we want an object with all flights tidied by key...
        const callbackKeyBy = (flightRow) => {
            return flightRow.flight.id;
        };

        const formattedRoundTripFlights = {
            goings: _.keyBy(roundTripFlights.goings, callbackKeyBy),
        };

        if (roundTripFlights.comings !== undefined) {
            formattedRoundTripFlights.comings = _.keyBy(roundTripFlights.comings, callbackKeyBy);
        }

        return formattedRoundTripFlights;
    }

    /**
     * Combine one way trip by price
     *
     * @param roundTripFlights
     */
    combineOneWayTripPrices (roundTripFlights) {
        // the key is the price
        const priceCombinations = {};

        _.each(roundTripFlights.goings, (flightDefinition, flightId) => {
            if (priceCombinations[flightDefinition.price] === undefined) {
                priceCombinations[flightDefinition.price] = [];
            }

            priceCombinations[flightDefinition.price].push([flightId]);
        });

        return priceCombinations;
    }

    /**
     * a low level language might outperform this function
     *
     * @param flightParams
     * @param flights object {goings: [], comings: []}
     */
    combineRoundTripFlights (flightParams, flights) {
        const resultCombination = [];
        // now we shall filter to get the combination going / coming
        _.each(flights.goings, (goingFlight, goingFlightId) => {
            // foreach comings, we check correct combinations according to departure / arrival times
            const goingFlightArrival = new Date(goingFlight.flight.arrival_time);

            _.each(flights.comings, (comingFlight, comingFlightId) => {
                // tried to use moment, but it wasn't a good idea for performances
                const comingFlightDeparture = new Date(comingFlight.flight.departure_time);

                // Coming back to home must be strictly after the going flight arrival
                if (comingFlightDeparture > goingFlightArrival) {
                    resultCombination.push([goingFlightId, comingFlightId]);
                }
            });
        });

        // @todo could be combined once more to have :
        // (by price) going flight with every coming flight possible
        // it would reduce the number of combinations and save some processing time
        // from the frontend
        return resultCombination;
    }

    /**
     * Search flights across multiple providers and normalize them
     *
     * @param flightParams FlightParams
     */
    searchFlights (flightParams) {
        var deferred = Q.defer();

        const strategyCallbacks = [];
        PROVIDERS.forEach((providerCode) => {
            // @todo error handle
            const strategy = require(`./flight-provider-strategies/${providerCode}-strategy`);

            strategyCallbacks.push(function (callback) {
                strategy.searchFlights(flightParams).then(flights => {
                    callback(null, flights);
                }, err => {
                    callback(err);
                });
            });
        });

        // we call in parallel each providers so that we get the response quicker
        // than we would have with a synchrone language
        async.parallel(strategyCallbacks, (err, res) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(_.flatten(res));
            }
        });

        return deferred.promise;
    }
}

module.exports = new FlightService();
