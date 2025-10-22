class App {
    constructor() {
        this.ContractAddress = "0xDEf80b6EfB09aa35a5252C3ddfd1bd0ABb045c52";
        this.AbiLocation = "./BlindAuction.json";
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
            this.accountBalance = await provider.getBalance(this.userAddress);

            document.getElementById("current_account").innerText = `${this.userAddress}`;
            document.getElementById("current_balance").innerText = `${ethers.utils.formatEther(this.accountBalance)} ETH`;

            this.updatePhaseDisplay();

            // Hide the overlay so user can interact with page now
            document.getElementById("overlay").style.display = "none";

            console.log("Connected to MetaMask and contract successfully.");
            console.log("User Address:", this.userAddress);

        } catch (error) {
            console.error("MetaMask connection failed:", error);
        }
    }
    async updatePhaseDisplay() {
        const phase = await this.contract.currentPhase();
        console.log("Current Phase:", phase);
        const phases = ['Bidding Not Started', 'Bidding', 'Reveal Started', 'Done'];
        const currentPhase = phases[phase];
        document.getElementById("phase-notification-text").innerText = currentPhase;
    }
    

    async showWinningBid() {
        try {
            if (!this.walletConnected) {
                alert("Please connect your wallet first");
                return;
            }

            const highestBidder = await this.contract.highestBidder();
            const highestBid = await this.contract.highestBid();
            
            const winnerDiv = document.getElementById("winner");
            
            const bidInEth = ethers.utils.formatEther(highestBid);
            winnerDiv.innerHTML = `
                <div class="alert alert-success">
                    <p><strong>Winner:</strong> ${highestBidder}</p>
                    <p><strong>Winning Bid:</strong> ${bidInEth} ETH</p>
                </div>
            `;
            

        } catch (error) {
            console.error("Error fetching winning bid:", error);
            alert("Error fetching winning bid: " + error.message);
        }
    }

    async advancePhase() {
        
        try {
            const tx = await this.contract.advancePhase();
            await tx.wait();
            toastr.success("Phase advanced successfully!");
            this.updatePhaseDisplay();
        } catch (error) {
            console.error("Error advancing phase:", error);
            toastr.error("Error advancing phase: " + error.message);
        }
        
    }

    async endAuction() {
        try {
            const tx = await this.contract.auctionEnd();
            await tx.wait();
            toastr.success("Auction ended successfully!");
        } catch (error) {
            console.error("Error ending auction:", error);
            toastr.error("Error ending auction: " + error.message);
        }
    }
    
}
    

document.addEventListener("DOMContentLoaded", async () => {
    const myApp = new App();
    await myApp.connectMetaMaskAndContract();

    document.getElementById("advance_phase_btn").addEventListener("click", async () => {
        myApp.advancePhase();
    });

    document.getElementById("show_winning_bid_btn").addEventListener("click", () => {
        myApp.showWinningBid();
    });
    

    document.getElementById("auction_end_btn").addEventListener("click", () => {
        myApp.endAuction();
        myApp.showWinningBid();
    });



});
