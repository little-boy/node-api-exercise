const DefaultStrategy = require('./default-strategy');
const _ = require('lodash');

class MoonStrategy extends DefaultStrategy {
    constructor () {
        super('moon');
    }

    normalizeFlightsResponse (response) {
        return _.map(response.data, (flightRowResult) => {
            return {
                provider: this.providerCode,
                price: flightRowResult.price,
                // we suppose that moon provider gives us a safe response.
                flight: flightRowResult.legs[0]
            }
        });
    }
}

module.exports = new MoonStrategy();
