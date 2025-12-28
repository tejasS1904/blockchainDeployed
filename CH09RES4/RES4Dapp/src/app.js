class App {
    constructor() {
        this.ContractAddress = "0x2cABe99485537F0602976F1BB79615DB906f5c0E";
        this.AbiLocation = "./ERC721RES4.json";
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

            console.log("Connected to MetaMask and contract successfully.");
            console.log("User Address:", this.userAddress);

        } catch (error) {
            console.error("MetaMask connection failed:", error);
        }
    }

    async addAsset() {
        try {
            const price = document.getElementById("asset_add_price").value;
            const ownerAddress = document.getElementById("asset_add_owner").value;
    
            const tx = await this.contract.addAsset(price, ownerAddress);
            await tx.wait();
            
            await this.loadAvailableAssets();
            toastr.success("Asset added successfully!");
            
        } catch (err) {
              console.error("Full error:", err);
            
              const reason =
                err?.error?.message ||      
                err?.error?.data?.message ||
                err?.data?.message ||
                err?.reason ||
                err?.shortMessage ||
                err?.message ||
                "Transaction failed";
            
              toastr.error("Failed to add asset: " + reason);
            }

    }
    
    async appreciateAsset() {
        try {
            const assetId = document.getElementById("assess_asset_id").value;
            const value = document.getElementById("assess_value").value;
    
            const tx = await this.contract.appreciate(assetId, value);
            await tx.wait();
            
            await this.loadAvailableAssets();
            toastr.success("Asset appreciated successfully!");
            
        } catch (error) {
            toastr.error("Failed to appreciate asset: " + (error.reason || error.message));
        }
    }
    
    async depreciateAsset() {
        try {
            const assetId = document.getElementById("assess_asset_id").value;
            const value = document.getElementById("assess_value").value;
    
            const tx = await this.contract.depreciate(assetId, value);
            await tx.wait();
            
            await this.loadAvailableAssets();
            toastr.success("Asset depreciated successfully!");
            
        } catch (error) {
            toastr.error("Failed to depreciate asset: " + (error.reason || error.message));
        }
    }
    
    async buildAsset() {
        try {
            const assetId = document.getElementById("build_asset_id").value;
            const value = document.getElementById("build_asset_value").value;
    
            const tx = await this.contract.build(assetId, value);
            await tx.wait();
            
            await this.loadAvailableAssets();
            toastr.success("Asset built successfully!");
            
        } catch (error) {
            toastr.error("Failed to build asset: " + (error.reason || error.message));
        }
    }
    
    async approveAsset() {
        try {
            const assetId = document.getElementById("approve_asset_id").value;
            const address = document.getElementById("approve_asset_address").value;
    
            const tx = await this.contract.approve(address, assetId);
            await tx.wait();
            
            await this.loadAvailableAssets();
            toastr.success("Asset approved successfully!");
            
        } catch (error) {
            toastr.error("Failed to approve asset: " + (error.reason || error.message));
        }
    }
    
    async clearApproval() {
        try {
            const assetId = document.getElementById("approve_asset_id").value;
    
            const tx = await this.contract.clearApproval(assetId);
            await tx.wait();
            
            await this.loadAvailableAssets();
            toastr.success("Approval cleared successfully!");
            
        } catch (error) {
            toastr.error("Failed to clear approval: " + (error.reason || error.message));
        }
    }
    
    async buyAsset() {
        try {
            const fromAddress = document.getElementById("buy_asset_address").value;
            const assetId = document.getElementById("buy_asset_id").value;
    
            const tx = await this.contract.transferFrom(fromAddress, this.userAddress, assetId);
            await tx.wait();
            
            await this.loadAvailableAssets();
            toastr.success("Asset purchased successfully!");
            
        } catch (error) {
            toastr.error("Failed to buy asset: " + (error.reason || error.message));
        }
    }

    async loadAvailableAssets() {
        try {
            if (!this.contract) {
                await this.connectMetaMaskAndContract();
            }
    
            const totalAssets = await this.contract.assetsCount();
            console.log(`Total assets: ${totalAssets}`);
            const assetsContainer = document.getElementById("assets");
    
            // Clear old cards
            assetsContainer.innerHTML = "";
    
            // Update balance text
            document.getElementById("balance").innerText = `Total: ${totalAssets.toString()}`;
    
            for (let i = 0; i < totalAssets; i++) {
                try {
                    const owner = await this.contract.ownerOf(i);
                    const approved = await this.contract.getApproved(i);
    
                    const assetData = await this.contract.assetMap(i);
                    const price = assetData.price.toString() + " ETH";

    
                    // Create card element
                    const card = document.createElement("div");
                    card.className = "col-lg-3";
                    card.innerHTML = `
                        <div class="card mb-3 shadow-sm">
                            <div class="card-body">
                                <h6 class="card-title">Asset #${i}</h6>
                                <p class="card-text">Price: ${price}</p>
                            </div>
                            <div class="card-footer">
                                <small>
                                    <b>Owner:</b> ${owner} <br>
                                    <b>Approved:</b> ${approved}
                                </small>
                            </div>
                        </div>
                    `;
    
                    // Append card to #assets
                    assetsContainer.appendChild(card);
    
                } catch (err) {
                    console.warn(`Skipping asset #${i} (might not exist):`, err);
                }
            }
    
        } catch (error) {
            console.error("Failed to load assets:", error);
        }
    }
    
    
}

document.addEventListener("DOMContentLoaded", async () => {
    const myApp = new App();
    await myApp.connectMetaMaskAndContract();
    await myApp.loadAvailableAssets();
    
    document.getElementById("add_asset").addEventListener("click", () => {
        myApp.addAsset();
    });
    
    document.getElementById("appreciate_asset").addEventListener("click", () => {
        myApp.appreciateAsset();
    });
    
    document.getElementById("depreciate_asset").addEventListener("click", () => {
        myApp.depreciateAsset();
    });
    
    document.getElementById("build_asset").addEventListener("click", () => {
        myApp.buildAsset();
    });
    
    document.getElementById("approve_asset").addEventListener("click", () => {
        myApp.approveAsset();
    });
    
    document.getElementById("clear_approval").addEventListener("click", () => {
        myApp.clearApproval();
    });
    
    document.getElementById("transfer_asset").addEventListener("click", () => {
        myApp.buyAsset();
    });
});
