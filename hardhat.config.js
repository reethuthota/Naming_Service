require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    mumbai: {
      url: "https://omniscient-intensive-paper.matic-testnet.quiknode.pro/238725fb03cc7f2f6a06dcdbc8dbba293568e6ea/",
      accounts: [process.env.WALLET_PRIVATE_KEY],
    }
  }
};
