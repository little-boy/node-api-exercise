const DefaultStrategy = require('./default-strategy');
const _ = require('lodash');

class JazzStrategy extends DefaultStrategy {
    constructor () {
        super('jazz');
    }

    normalizeFlightsResponse (response) {
        return _.map(response.data, (flightRowResult) => {
            return {
                provider: this.providerCode,
                price: flightRowResult.price,
                // we suppose that moon provider gives us a safe response.
                flight: flightRowResult.flight
            }
        });
    }
}

module.exports = new JazzStrategy();
