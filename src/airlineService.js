
export class AirlineService {
    constructor(contract) {
        this.contract = contract;
    }

    async getFlights() {
        let total = await this.getTotalFlights();
        let flights = [];
        for (let i = 0; i < total; i++) {
            let flight = await this.contract.flights(i);
            flights.push(flight);
        }
        return this, this.mapFlights(flights)
    }

    async buyFlight(flightIndex, from, value) {
        return this.contract.buyFlight(flightIndex, { from, value });
    }

    async getCustomerFlights(account) {
        let customerTotalFlights = await this.contract.customerTotalFlights(account);
        let flights = [];
        for (let i = 0; i < customerTotalFlights.toNumber(); i++) {
            let flight = await this.contract.customerFlights(account, i);
            flights.push(flight);
        }
        return this, this.mapFlights(flights)
    }

    async getRefundableEther(from) {
        return this.contract.getRefundableEther({ from })
    }

    async redeemLoyaltyPoints(from) {
        return this.contract.redeemLoyaltyPoints({ from });
    }

    async getTotalFlights() {
        return (await this.contract.totalFights()).toNumber();
    }

    mapFlights(flights) {
        return flights.map(flight => {
            return {
                name: flight[0],
                price: flight[1].toNumber()
            }
        })
    }

}