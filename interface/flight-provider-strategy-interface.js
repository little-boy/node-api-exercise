// I implemented here a basic concept of interface
// But I would be much confortable with something like TypeScript
class FlightProviderStrategyInterface {
    constructor () {
        if (!this.searchFlights) {
            throw new Error('Flight Provider should have a "searchFlights" method');
        }

        if (!this.normalizeFlightsResponse) {
            throw new Error('Flight Provider should have a "normalizeFlightsResponse" method');
        }
    }
}

module.exports = FlightProviderStrategyInterface;

