# MPC

## Instructions

### 1. Compile and Deploy Smart Contract

**Terminal 1:**

```bash
cd CH08MPC/MPC
npx hardhat compile
npx hardhat node

```

**Terminal 2:**

```bash
cd CH08MPC/MPC
npx hardhat ignition deploy ./ignition/modules/MPC.js --network localhost
```
This deploy script the contract with Account #1 as organizer and Account #0 as worker


**Note the deployment address from the output** - will be required

### 2. Setup Worker DApp

**Terminal 3:**

```bash
cd CH08MPC/mpcDappWorker

```

1.  Open `CH08MPC/mpcDappWorker/src/js/app.js`
    
2.  Update the fields address and the network_id in the app.js:
    
    ```javascript
    address: '0x846...<fill in your deployed address>',   
    network_id: 31337,
    
    ```
    
3.  Install dependencies and start:
    
    ```bash
    npm install
    npm start
    
    ```
    

**Browser Setup for Worker:**

-   Open a browser window with MetaMask
-   Connect to **Account #0**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (10000 ETH)
-   Navigate to the Worker DApp page

### 3. Setup Organizer DApp

**Terminal 4:**

```bash
cd CH08MPC/mpcDappOrganizer

```

1.  Open `CH08MPC/mpcDappOrganizer/src/js/app.js`
    
2.  Update the fields address and the network_id in the app.js:
    
    ```javascript
    address: '0x846...<fill in your deployed address>',   
    network_id: 31337,
    
    ```
    
3.  Install dependencies and start:
    
    ```bash
    npm install
    npm start
    
    ```
    

**Browser Setup for Organizer:**

-   Open a **new browser window** with MetaMask
-   Connect to **Account #1**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (10000 ETH)
-   Navigate to the Organizer DApp page
