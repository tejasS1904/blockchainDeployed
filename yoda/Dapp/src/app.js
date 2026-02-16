class App {
    constructor() {
        this.ContractAddress = "0x9Dcb6D5045878A38Ea99711520bcE16174021e01";
        this.AbiLocation = "./yoda.json";
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

    updateStatus(message) {
        document.getElementById('statusMessage').textContent = message;
    }

    async receiveTokens() {
        if (!this.walletConnected) {
            this.updateStatus("Please connect MetaMask first");
            return;
        }
        try {
            this.updateStatus("Requesting tokens...");
            let tx = await this.contract.recieveTokens();
            this.updateStatus("Transaction sent, waiting for confirmation...");
            await tx.wait();
            this.updateStatus("Tokens received successfully!");
            toastr.success("Tokens received successfully!");
        } catch (error) {
            console.error("Failed to receive tokens:", error);
            console.log("Failed to receive tokens: " + error.message);
            toastr.error("Failed to receive tokens: You have probably already received your tokens once");
        }
    }

}

    
document.addEventListener("DOMContentLoaded", async () => {
    const myApp = new App();
    await myApp.connectMetaMaskAndContract();

    document.getElementById('receiveTokensBtn').addEventListener('click', () => {
        myApp.receiveTokens();
    });


});
