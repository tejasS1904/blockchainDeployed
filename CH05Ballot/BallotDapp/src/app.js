    class App {
        constructor() {
            this.ContractAddress = "0x1C2dD37091b9dF7a060f6BDEd3bf3AB8F4ed152B";
            this.AbiLocation = "./Ballot.json";
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

        async handleVote(event) {
            const clickedButton = event.target.id;
        
            let proposalId;
            switch (clickedButton) {
                case 'Proposal0':
                    proposalId = 0; 
                    break;
                case 'Proposal1':
                    proposalId = 1;
                    break;
                case 'Proposal2':
                    proposalId = 2;
                    break;
                case 'Proposal3':
                    proposalId = 3;
                    break;
                default:
                    console.error("Invalid proposal selected");
                    return;
            }
        
            try {
                const tx = await this.contract.vote(proposalId);
                await tx.wait();
        
                console.log("Vote successful:", tx);
                
                const proposalNames = ["Milli", "Murphy", "Radar", "Riley"];
                console.log(`You voted for Proposal ${proposalId}`);
                toastr.success(`You voted for ${proposalNames[proposalId]}`);
            } catch (error) {
                console.error("Error voting:", error);
                toastr.error("Error in voting: Already Voted");
            }
            
        }

        async registerVoter() {
            try {
                if (!this.walletConnected || !this.contract) {
                    toastr.error("Please connect your wallet first");
                    return;
                }
    
                const addressInput = document.getElementById("register-address");
                const voterAddress = addressInput.value.trim();
    
                if (!voterAddress) {
                    toastr.error("Please enter a voter address");
                    return;
                }
    
                if (!ethers.utils.isAddress(voterAddress)) {
                    toastr.error("Please enter a valid Ethereum address");
                    return;
                }
    
                const tx = await this.contract.register(voterAddress);
                await tx.wait();
    
                console.log("Voter registration successful:", tx);
                toastr.success(`Voter ${voterAddress} registered successfully!`);
                
                // Clear the input field
                addressInput.value = "";
    
            } catch (error) {
                console.error("Error registering voter:", error);
                if (error.message.includes("revert")) {
                    toastr.error("Only the chairperson can register voters");
                } else {
                    toastr.error("Error registering voter: " + error.message);
                }
            }
        }
    
        async declareWinner() {
            try {
                if (!this.walletConnected || !this.contract) {
                    toastr.error("Please connect your wallet first");
                    return;
                }
    
                const winningProposalId = await this.contract.reqWinner();
                
                const proposalNames = ["Milli", "Murphy", "Radar", "Riley"];
                const winnerName = proposalNames[winningProposalId];
    
                console.log("Winner declared:", winnerName, "Proposal ID:", winningProposalId.toString());
                
                const winnerResult = document.getElementById("winner-result");
                const winnerNameSpan = document.getElementById("winner-name");
                
                winnerNameSpan.textContent = winnerName;
                winnerResult.style.display = "block";
                winnerResult.className = "alert alert-success";
                
                toastr.success(`Winner declared: ${winnerName}!`);
    
            } catch (error) {
                
                toastr.error("Error declaring winner: Atleast 3 votes required "); //+ error.message);
                console.log(error.message);
                
                const winnerResult = document.getElementById("winner-result");
                winnerResult.style.display = "none";
            }
        }
    }
        

    document.addEventListener("DOMContentLoaded", async () => {
        const myApp = new App();
        await myApp.connectMetaMaskAndContract();

        document.querySelectorAll('.btn-vote').forEach(button => {
            button.addEventListener('click', (event) => myApp.handleVote(event));
        });
        /*
        document.getElementById("register-voter").addEventListener("click", () => {
            myApp.registerVoter();
        });
        */
    
        document.getElementById("declare-winner").addEventListener("click", () => {
            myApp.declareWinner();
        });

    });
