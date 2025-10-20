    class App {
        constructor() {
            this.ContractAddress = "0x4798A65b2069356A300f09Ed4df338a3778fdd13";
            this.AbiLocation = "./Counter.json";
            this.ContractABI = null;
            this.signer = null;
            this.contract = null;
            this.walletConnected = false;
            this.userAddress = null;
        }

        async loadABI() {
            try {
                const response = await fetch(this.AbiLocation);
                const data = await response.json();
                this.ContractABI = data.abi;
                console.log("ABI loaded successfully.", this.ContractABI);
            } catch (error) {
                console.error("Failed to load ABI:", error);
            }
        }

        async connectMetaMaskAndContract() {
            try {
                if (!window.ethereum) {
                    alert("MetaMask not detected. Please install it.");
                    return;
                }

                if (!this.ContractABI) {
                    await this.loadABI();
                }

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                this.signer = provider.getSigner();

                this.contract = new ethers.Contract(
                    this.ContractAddress,
                    this.ContractABI,
                    this.signer
                );

                this.walletConnected = true;
                this.userAddress = await this.signer.getAddress();

                // Hide the overlay so user can interact with page now
                document.getElementById("overlay").style.display = "none";

                console.log("Connected to MetaMask and contract successfully.");
                console.log("User Address:", this.userAddress);

            } catch (error) {
                console.error("MetaMask connection failed:", error);
            }
        }
        async initialize() {
            if (!this.walletConnected) {
                this.updateStatus("Please connect MetaMask first");
                return;
            }

            try {
                const initValue = parseInt(document.getElementById('initValue').value) || 1;
                this.updateStatus("Sending transaction...");
                
                let tx;
                tx = await this.contract.initialize(initValue);

                this.updateStatus("Transaction sent, waiting for confirmation...");
                await tx.wait();
                
                this.updateStatus("Initialization successful!");
                setTimeout(() => this.getCount(), 500);

            } catch (error) {
                console.error("Initialization failed:", error);
                // this.updateStatus("Initialization failed: " + error.message);
            }
        }

        async increment() {
            if (!this.walletConnected) {
                this.updateStatus("Please connect MetaMask first");
                return;
            }

            try {
                const incrementValue = parseInt(document.getElementById('incrementValue').value) || 1;
                this.updateStatus("Sending transaction...");
                
                let tx;
                tx = await this.contract.increment(incrementValue);

                this.updateStatus("Transaction sent, waiting for confirmation...");
                await tx.wait();
                
                this.updateStatus("Increment successful!");
                setTimeout(() => this.getCount(), 500);

            } catch (error) {
                console.error("Increment failed:", error);
                // this.updateStatus("Increment failed: " + error.message);
            }
        }

        async decrement() {
            if (!this.walletConnected) {
                this.updateStatus("Please connect MetaMask first");
                return;
            }

            try {
                const decrementValue = parseInt(document.getElementById('decrementValue').value) || 1;
                this.updateStatus("Sending transaction...");
                
                let tx;
                tx = await this.contract.decrement(decrementValue);

                this.updateStatus("Transaction sent, waiting for confirmation...");
                await tx.wait();
                
                this.updateStatus("Decrement successful!");
                setTimeout(() => this.getCount(), 1000);

            } catch (error) {
                console.error("Decrement failed:", error);
                // this.updateStatus("Decrement failed: " + error.message);
            }
        }
        async getCount() {
            if (!this.walletConnected) {
                this.updateStatus("Please connect MetaMask first");
                return;
            }

            try {
                this.updateStatus("Getting count...");
                const result = await this.contract.get();
                const count = result.toString();
                
                document.getElementById('counterValue').textContent = count;
                this.updateStatus("Count updated successfully");

            } catch (error) {
                console.error("Get count failed:", error);
                // this.updateStatus("Failed to get count: " + error.message);
            }
        }

        updateStatus(message) {
            document.getElementById('statusMessage').textContent = message;
        }
    }

        
    document.addEventListener("DOMContentLoaded", async () => {
        const myApp = new App();
        await myApp.connectMetaMaskAndContract();

        document.getElementById('initBtn').addEventListener('click', () => {
            myApp.initialize();
        });

        document.getElementById('incrementBtn').addEventListener('click', () => {
            myApp.increment();
        });

        document.getElementById('decrementBtn').addEventListener('click', () => {
            myApp.decrement();
        });

        document.getElementById('getCountBtn').addEventListener('click', () => {
            myApp.getCount();
        });

        // Load initial count
        setTimeout(() => myApp.getCount(), 2000);
        

    });
