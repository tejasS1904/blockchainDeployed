

## Setup and Deployment

### 1. Deploy Smart Contract

For each project, follow these steps to deploy the smart contract:

1. Navigate to the `contracts` directory within each project folder
2. Download or locate the Solidity file (.sol)
3. Open [Remix IDE](https://remix.ethereum.org/)
4. Compile the Solidity file
5. Deploy it to your desired network
6. Copy the contract address from the deployment section

### 2. Update Contract Address in DApp

After deploying the smart contract, you need to update the contract address in the frontend:

#### For CH05Ballot, CH08BlindAuction, CH09RES4, and Counter:
- Navigate to `src/app.js` in the respective DApp folder
- Update the contract address variable with your deployed contract address

#### For CH08MPC:
- Navigate to `CH08MPC/mpcDappOrganizer/src/js/` and `CH08MPC\mpcDappWorker\src\js`
- Update the contract address in the JavaScript file `app.js'

### 3. Access the DApps

deploy this repo as github pages , Thats it!
