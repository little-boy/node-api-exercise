class FlightParams {
    constructor (
        departureAirport,
        arrivalAirport,
        departureDate,
        returnDate,
        tripType
    ) {
        this.departureAirport = departureAirport;
        this.arrivalAirport = arrivalAirport;
        this.departureDate = departureDate;
        this.returnDate = returnDate;
        this.tripType = tripType;
    }

    /**
     * Format query params to a normalized object
     * corresponding to a going search query
     *
     * @return {{departureAirport: *, departureDate: *, arrivalAirport: *}}
     */
    getGoing() {
        return {
            departureAirport: this.departureAirport,
            arrivalAirport: this.arrivalAirport,
            departureDate: this.departureDate,
        }
    }

    /**
     * Format query params to a normalized object
     * corresponding to a coming search query
     *
     * @return {{departureAirport: *, departureDate: *, arrivalAirport: *}}
     */
    getComing() {
        return {
            departureAirport: this.arrivalAirport,
            arrivalAirport: this.departureAirport,
            departureDate: this.returnDate,
        }
    }
}

module.exports = FlightParams;

