# RES4

## Instructions

### 1. Compile and Deploy Smart Contract and run a Hardhat Node

**Terminal 1:**

```bash
cd CH09RES4/RES4
npx hardhat compile
npx hardhat node

```

**Terminal 2:**

```bash
cd CH09RES4/RES4
npx hardhat ignition deploy ./ignition/modules/res4.ts --network localhost
```
This deploys the contract


**Note the deployment address from the output** - will be required

### 2. Setup The DApp

**Terminal 3:**

```bash
cd CH09RES4/RES4Dapp

```

1.  Open `CH09RES4/RES4Dapp/src/app.js`
    
2.  Update the fields address in the app.js:
    
    ```javascript
    this.ContractAddress = '5FbD...<fill in your deployed address>';    
    ```
    
3.  Install dependencies and start:
    
    ```bash
    npm install
    npm start
    
    ```
    