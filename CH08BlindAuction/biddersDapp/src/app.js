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

            // Hide the overlay so user can interact with page now
            document.getElementById("overlay").style.display = "none";
            
            this.updatePhaseDisplay();

            console.log("Connected to MetaMask and contract successfully.");
            console.log("User Address:", this.userAddress);

        } catch (error) {
            console.error("MetaMask connection failed:", error);
        }
    }
    async updatePhaseDisplay() {
        const phase = await this.contract.currentPhase();
        const phases = ['Bidding Not Started', 'Bidding', 'Reveal Started', 'Done'];
        const currentPhase = phases[phase];
        document.getElementById("phase-notification-text").innerText = currentPhase;
    }
    

    generateBlindedBid(bidAmount, otp) {
        const bidAmountWei = ethers.utils.parseEther(bidAmount.toString());
        
        // Convert string OTP to bytes32
        const otpBytes32 = ethers.utils.formatBytes32String(otp);
        
        // Only include value and secret (no address)
        const encodedData = ethers.utils.solidityPack(
            ['uint256', 'bytes32'],
            [bidAmountWei, otpBytes32]
        );
        
        return ethers.utils.keccak256(encodedData);
    }

    async handleGenerateBlindedBid() {
        try {
            const bidValue = document.getElementById("bid-value").value;
            const otpValue = document.getElementById("otp-value").value;

            if (!bidValue || !otpValue) {
                alert("Please enter both bid amount and OTP");
                return;
            }

            if (!this.walletConnected) {
                alert("Please connect your wallet first");
                return;
            }

            this.generatedBlindedBid = this.generateBlindedBid(bidValue, otpValue);
            document.getElementById("blinded-bid-value").value = this.generatedBlindedBid;
            
            document.getElementById("blinded-bid-value-userinp").value = this.generatedBlindedBid;
            toastr.success("Blinded bid generated successfully! You can now submit your bid.");

        } catch (error) {
            console.error("Error generating blinded bid:", error);
            alert("Error generating blinded bid: " + error.message);
        }
    }

    async SubmitBid() {
        const blindedBid = document.getElementById("blinded-bid-value-userinp").value;
        const depositEth = document.getElementById("deposit-value").value;
        const depositWei = ethers.utils.parseEther(depositEth.toString());

        const tx = await this.contract.bid(blindedBid, {
            value: depositWei,
            gasLimit: 300000 // Set appropriate gas limit
            }
        );

        tx.wait();
        toastr.success("Bid submitted successfully!");
    }
    async revealBid() {
        const bidValue = document.getElementById("bet-reveal").value;
        const otp = document.getElementById("password").value;
        
        const bidValueWei = ethers.utils.parseEther(bidValue.toString());
        const otpBytes32 = ethers.utils.formatBytes32String(otp);
        
        const tx = await this.contract.reveal(bidValueWei, otpBytes32);
        await tx.wait();
        toastr.success("Bid revealed successfully!");
    }
    async withdrawBid() {
        try {
            const tx = await this.contract.withdraw({
                gasLimit: 200000
            });

            await tx.wait();
            toastr.success("Withdrawal successful!");
            
            // Update balance after withdrawal
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            this.accountBalance = await provider.getBalance(this.userAddress);
            document.getElementById("current_balance").innerText = `${ethers.utils.formatEther(this.accountBalance)} ETH`;

        } catch (error) {
            console.error("Error withdrawing bid:", error);
            toastr.error("Error withdrawing bid: " + error.message);
        }
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
    
}
    

document.addEventListener("DOMContentLoaded", async () => {
    const myApp = new App();
    await myApp.connectMetaMaskAndContract();

    document.getElementById("generate-blinded-bid").addEventListener("click", () => {
        myApp.handleGenerateBlindedBid();
    });
    
    document.getElementById("submit-bid").addEventListener("click", () => {
        myApp.SubmitBid();
    });
    
    document.getElementById("submit-reveal").addEventListener("click", () => {
        myApp.revealBid();
    });

    document.getElementById("withdraw-bid").addEventListener("click", () => {
        myApp.withdrawBid();
    });

    document.getElementById("generate-winner").addEventListener("click", () => {
        myApp.showWinningBid();
    });

});
