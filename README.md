### Description
This repository contains the minimal code needed to deploy all the DApps for the *Blockchain in Action* book on GitHub Pages.  
It includes the necessary smart contracts for each DApp.

To demo any DApp in class, simply follow the instructions below for the respective DApp.

---

### 1. Deploy Smart Contract

For each project, follow these steps to deploy the smart contract:

1. Navigate to the `contracts` directory within each project folder.  
2. Download or locate the Solidity file (`.sol`).  
3. Open [Remix IDE](https://remix.ethereum.org/).  
4. Compile the Solidity file.  
5. Deploy it to your desired network.  
6. Copy the contract address from the deployment section.

---

### 2. Update Contract Address in DApp

After deploying the smart contract, update the contract address in the frontend.

#### For `CH05Ballot`, `CH08BlindAuction`, `CH09RES4`, and `Counter`:
- Navigate to `src/app.js` in the respective DApp folder.  
- Update the contract address variable with your deployed contract address.

#### For `CH08MPC`:
- Navigate to `CH08MPC/mpcDappOrganizer/src/js/` and `CH08MPC/mpcDappWorker/src/js/`.  
- Update the contract address in the JavaScript file `app.js`.

---

### 3. Access the DApps

Deploy this repo as GitHub Pages if not already done , that’s it!

---

### Notes
For the Ballot DApp, the **register voter** functionality has been commented out in the frontend, and the contract function modified to not require registration.
For the Blind Auction App the **contract** has been modified so the beneficiary can also place bids
