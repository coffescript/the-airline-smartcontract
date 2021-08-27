const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = '';
const provider_url = '';

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*',
      gas: 5000000
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, provider_url, 0),
      network_id: 4,
      gas: 6500000,
      gasPrice: 100000000000,
      // from: '0xE70d19B9b8ab777AdfF22504cbfa8A276c36167a'
    }
  }
}
