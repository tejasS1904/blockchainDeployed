# Blind Auction

## Instructions

### 1. Compile and Deploy Smart Contract

**Terminal 1:**

```bash
cd CH08BlindAuction/BlindAuction
npm install
npx hardhat compile
npx hardhat node

```

**Terminal 2:**

```bash
cd CH08BlindAuction/BlindAuction
npx hardhat ignition deploy ./ignition/modules/blindAuction.ts --network localhost
```
This deploy script the contract with Account #1 as organizer and Account #0 as worker


**Note the deployment address from the output** - will be required


### 2. Setup Benificary DApp

**Terminal 3:**

```bash
cd CH08BlindAuction/benificiaryDapp

```

1.  Open `biddersDapp/src/app.js`
    
2.  Update the fields this.ContractAddress in the app.js:
    
    ```javascript
    this.ContractAddress = "0x5Fb...<your contract adress>"
    
    ```
    
3.  Install dependencies and start:
    
    ```bash
    npm install
    npm start
    
    ```
    
**Browser Setup for Benificary:**

-   Open a **new browser window** with MetaMask
-   Connect to **Account #0**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (10000 ETH)
-   Navigate to the Benificary DApp page http://localhost:3000

### 2. Setup Bidders DApp

**Terminal 4:**

```bash
cd CH08BlindAuction/biddersDapp

```

1.  Open `biddersDapp/src/app.js`
    
2.  Update the fields this.ContractAddress in the app.js:
    
    ```javascript
    this.ContractAddress = "0x5Fb...<your contract adress>"
    
    ```
    
3.  Install dependencies and start:
    
    ```bash
    npm install
    npm start
    
    ```
    

**Browser Setup for Bidder:**

-   Open a browser window with MetaMask
-   Connect to **Account #1**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (10000 ETH)
-   Navigate to the Bidder DApp page  http://localhost:3001
