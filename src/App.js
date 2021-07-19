import React, { Component } from "react";
import AirlineContract from "./airline";
import getWeb3 from "./getWeb3";
import Panel from "./Panel";
import { AirlineService } from './airlineService';
import { ToastContainer } from 'react-toastr';

const converter = (web3) => {
    return (value) => {
        return web3.utils.fromWei(value.toString(), 'ether');
    }
}

export class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            metamaskWallet: '',
            balance: 0,
            flights: [],
            customerFlights: [],
            refundableEther: 0
        }
    }

    async componentDidMount() {
        this.web3 = await getWeb3();
        this.toEther = converter(this.web3);
        this.airline = await AirlineContract(this.web3.currentProvider);
        this.airlineService = new AirlineService(this.airline);

        var account = (await this.web3.eth.getAccounts())[0]

        console.log(this.airline);

        let flightPurchased = this.airline.FlightPurchased();
        flightPurchased.watch(function (err, result) {
            const { customer, price, flight } = result.args;

            if (customer === this.state.metamaskWallet) {
                console.log(`You purchased a flight to ${flight} with a cost of ${price}`);
            } else {
                this.container.success(`Last customer purchased a flight to ${flight} with a cost of ${price}`, 'Flight Information');
            }
        }.bind(this));

        window.ethereum.on('accountsChanged', function (accounts) {
            // Time to reload your interface with accounts[0]!
            console.log(accounts)
            this.setState({
                metamaskWallet: accounts.toString().toLowerCase()
            }, () => {
                this.load();
            })
        }.bind(this))
        /**
         * this.web3.currentProvider.publicConfigStore.on('update', async function (event) {
            console.log(event);
            this.setState({
                metamaskWallet: event.selectedAddress.toLowerCase()
            }, () => {
                this.load();
            })            
        }.bind(this));
         */

        this.setState({
            metamaskWallet: account.toLowerCase(),
        }, () => {
            this.load();
        });
    }

    async getBalance() {
        let weiBalance = await this.web3.eth.getBalance(this.state.metamaskWallet);
        this.setState({
            balance: this.toEther(weiBalance)
        })
    }

    async getFlights() {
        let flights = await this.airlineService.getFlights();
        this.setState({
            flights
        })
    }

    async getRefundableEther() {
        let refundableEther = this.toEther(await this.airlineService.getRefundableEther(this.state.metamaskWallet));
        this.setState({
            refundableEther
        })
    }

    async getCustomerFlights() {
        let customerFlights = await this.airlineService.getCustomerFlights(this.state.metamaskWallet);
        this.setState({
            customerFlights
        })
    }

    async buyFlight(flightIndex, flight) {
        console.log(flightIndex, flight)
        await this.airlineService.buyFlight(flightIndex, this.state.metamaskWallet, flight.price);
        await this.getBalance();
        await this.getFlights();
        await this.getCustomerFlights();
        await this.getRefundableEther();
    }

    async refundLoyaltyPoints() {
        await this.airlineService.redeemLoyaltyPoints(this.state.metamaskWallet);
        await this.getBalance();
        await this.getFlights();
        await this.getCustomerFlights();
        await this.getRefundableEther();
    }

    async load() {
        this.getBalance();
        this.getFlights();
        this.getCustomerFlights();
        this.getRefundableEther();
    }

    render() {
        return <React.Fragment>
            <div className="jumbotron">
                <h4 className="display-4">Welcome to the Airline!</h4>
            </div>

            <div className="row">
                <div className="col-sm">
                    <Panel title="Balance">
                        <p><strong>{this.state.metamaskWallet}</strong></p>
                        <span><strong>Balance: {this.state.balance}</strong></span>
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Loyalty points - refundable ether">
                        <span>{this.state.refundableEther} ETH</span>
                        <button onClick={() => this.refundLoyaltyPoints()} className="btn btn-sm btn-success text-white">Refund</button>
                    </Panel>
                </div>
            </div>
            <div className="row">
                <div className="col-sm">
                    <Panel title="Available flights">
                        {this.state.flights.map((flight, i) => {
                            return <div key={i}>
                                <span>{flight.name} - cost: {this.toEther(flight.price)}</span>
                                <button onClick={() => this.buyFlight(i, flight)} className="btn btn-sm btn-success text-white">Purchase</button>
                            </div>
                        })}
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Your flights">
                        {this.state.customerFlights.map((flight, i) => {
                            return <div key={i}>
                                <span>{flight.name} - cost: {this.toEther(flight.price)}</span>
                            </div>
                        })}
                    </Panel>
                </div>
            </div>
            <ToastContainer ref={(input) => this.container = input} className="toast-top-right" />
        </React.Fragment>
    }
}