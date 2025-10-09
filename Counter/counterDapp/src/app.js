    class App {
        constructor() {
            this.ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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

        async increment() {
            if (!this.walletConnected) {
                this.updateStatus("Please connect MetaMask first");
                return;
            }

            try {
                const incrementValue = parseInt(document.getElementById('incrementValue').value) || 1;
                this.updateStatus("Sending transaction...");
                
                let tx;
                if (incrementValue === 1) {
                    tx = await this.contract.inc();
                } else {
                    tx = await this.contract.incBy(incrementValue);
                }
                
                this.updateStatus("Transaction sent, waiting for confirmation...");
                await tx.wait();
                
                this.updateStatus("Increment successful!");
                setTimeout(() => this.getCount(), 1000);

            } catch (error) {
                console.error("Increment failed:", error);
                this.updateStatus("Increment failed: " + error.message);
            }
        }

        // async decrement() {
        //     if (!this.walletConnected) {
        //         this.updateStatus("Please connect MetaMask first");
        //         return;
        //     }

        //     try {
        //         const decrementValue = parseInt(document.getElementById('incrementValue').value) || 1;
        //         this.updateStatus("Getting current count...");
                
        //         const currentCount = await this.contract.x();
        //         const currentValue = currentCount.toNumber();
                
        //         if (currentValue < decrementValue) {
        //             this.updateStatus(`Cannot decrement by ${decrementValue}. Current value is ${currentValue}`);
        //             return;
        //         }

        //         // Since the contract doesn't have a decrement function, we'll simulate it
        //         // by calculating the new value and setting it (this is a limitation of your current contract)
        //         this.updateStatus("Note: Contract only supports increment. Cannot decrement.");

        //     } catch (error) {
        //         console.error("Decrement failed:", error);
        //         this.updateStatus("Decrement failed: " + error.message);
        //     }
        // }

        async getCount() {
            if (!this.walletConnected) {
                this.updateStatus("Please connect MetaMask first");
                return;
            }

            try {
                this.updateStatus("Getting count...");
                const result = await this.contract.x();
                const count = result.toNumber();
                
                document.getElementById('counterValue').textContent = count;
                this.updateStatus("Count updated successfully");

            } catch (error) {
                console.error("Get count failed:", error);
                this.updateStatus("Failed to get count: " + error.message);
            }
        }

        updateStatus(message) {
            document.getElementById('status').textContent = message;
        }
    }

        
    document.addEventListener("DOMContentLoaded", async () => {
        const myApp = new App();
        await myApp.connectMetaMaskAndContract();

        document.getElementById('incrementBtn').addEventListener('click', () => {
            myApp.increment();
        });

        // document.getElementById('decrementBtn').addEventListener('click', () => {
        //     myApp.decrement();
        // });

        document.getElementById('getCountBtn').addEventListener('click', () => {
            myApp.getCount();
        });

        // Load initial count
        setTimeout(() => myApp.getCount(), 2000);
        

    });
