# Polygon ENS (Ethereum Name Service)
<img width="1512" alt="CryptoConnect Website" src="https://github.com/reethuthota/Naming_Service/assets/129527629/ab9f50ce-867d-417f-8f51-c5d5d881067f">

## Overview

This project is a decentralized naming service using Solidity for the backend smart contracts and React for the frontend interface. It allows users to register and manage unique names associated with Ethereum addresses on the Polygon network.

### Features

- **Name Registration:** Users can register unique names tied to their Ethereum addresses on the Polygon network.
- **Frontend Interface:** Built with React to interact with the Solidity smart contracts.

## Installation

### Prerequisites

- Node.js & npm installed
- Metamask extension or any Ethereum-enabled browser

### Backend (Solidity)

1. Navigate to the `Solidity` directory.
2. Install dependencies with `npm install`.
3. Compile the Solidity contracts using a Solidity compiler like `solc`.

   ```bash
   npx hardhat compile
4. Deploy the contracts to the Polygon Mumbai testnet using Hardhat
    ```bash
    npx hardhat run scripts/deploy.js --network mumbai
### Frontend (React) 
1. Navigate to the `React` directory.
2. Install dependencies with `npm install`.
3. Start the development server.

## Deploying to Mainnet
To deploy the contracts to the Polygon mainnet, modify the deployment script to target the mainnet in scripts/deploy.js, and execute the deployment command again.
