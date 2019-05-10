const Q = require('q');
const axios = require('axios');
const FlightProviderStrategyInterface = require('../../interface/flight-provider-strategy-interface');

// should be moved as a (env?) configuration
const DEFAULT_PROVIDER_URL = 'http://flights.beta.bcmenergy.fr';

/**
 * We use here a Strategy design pattern
 * This defaultStrategy contains logic that is shared between
 * jazz and moon providers
 */
class DefaultStrategy extends FlightProviderStrategyInterface {
    constructor (providerCode) {
        super();
        this.providerUrl = `${DEFAULT_PROVIDER_URL}/${providerCode}/flights?`;
        this.providerCode = providerCode;
    }

    /**
     * @inheritDoc
     * @param flightParams
     * @return Promise
     */
    searchFlights(flightParams) {
        const deferred = Q.defer();

        const params = {
            departure_airport: flightParams.departureAirport,
            arrival_airport: flightParams.arrivalAirport,
            departure_date: flightParams.departureDate
        };

        // could be refactored in a service
        const esc = encodeURIComponent;
        // query params as a string
        const queryParams = Object.keys(params)
            .map(k => esc(k) + '=' + esc(params[k]))
            .join('&');

        const URL = `${this.providerUrl}${queryParams}`;

        axios.get(URL)
            .then(response => {
                deferred.resolve(this.normalizeFlightsResponse(response));
            })
            // @todo error handle
            .catch(deferred.reject);

        return deferred.promise;
    }
}

module.exports = DefaultStrategy;
