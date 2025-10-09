App = {
  web3: null,
  contracts: {},
  address:'0x8464135c8F25Da09e49BC8782676a84730C318bC',   
  network_id:31337,
  url:'',
  currentAccount:'',  
  worker:'',
  organizer:'',
  value:1000000000000000000,
  index:0,
  margin:10,
  left:15,
  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    if (typeof window.ethereum !== 'undefined') {
      App.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error('User denied account access:', error);
        toastr.error("Please connect your MetaMask wallet");
        return;
      }
    } else {
      App.web3 = new Web3(App.url);
      console.log('No web3 provider detected. Falling back to local provider.');
    }
  
    return App.initContract();
  },
  

  initContract: function() {
    App.contracts.Payment = new App.web3.eth.Contract(App.abi,App.address, {});
    App.web3.eth.getBalance(App.contracts.Payment._address).then((res)=>{ 
      jQuery('#channel_balance').text(App.web3.utils.fromWei(res, "ether"));
      // jQuery('#contract_address').text(App.contracts.Payment._address);
    })        
    App.web3.eth.getAccounts((err, accounts) => {  
      if(!err){
        App.currentAccount=accounts[0];
        App.contracts.Payment.methods.sender().call().then((res)=>{
          App.organizer=res;
          App.web3.eth.getBalance(App.organizer).then((res)=>{ jQuery('#organizer_balance').text(App.web3.utils.fromWei(res, "ether"));});

        });
        App.contracts.Payment.methods.recipient().call().then((res)=>{
          App.worker=res;
          App.web3.eth.getBalance(App.worker).then((res)=>{ jQuery('#worker_balance').text(App.web3.utils.fromWei(res, "ether"));});
          jQuery('#worker').val(App.worker);
          if(App.currentAccount==App.worker){                
            jQuery('#WorkersForm').css('display','block');                
          } 
        }); 
      }     
    }); 
    return App.bindEvents();
  },  

  bindEvents: function() {  
    $(document).on('click', '#transfer', function(){
      App.handleTransfer(jQuery('#workeramount').val(),jQuery('#signedMessage').val());
    });
  }, 


    handleTransfer:function(amount,signature){

      //toHex conversion to support big numbers
      if(App.web3.utils.isHexStrict(signature)){
      var weiamount=App.web3.utils.toWei(amount,'ether')
      var amount=App.web3.utils.toHex(weiamount)
      var option={from:App.worker}
      App.contracts.Payment.methods.claimPayment(amount,signature)
      .send(option)
      .on('receipt', (receipt) => {
        if(receipt.status){
            toastr.success("Funds are transferred to your account");
            // App.populateAddress();
            App.web3.eth.getBalance(App.contracts.Payment._address).then((res)=>{ jQuery('#channel_balance').text(App.web3.utils.fromWei(res, "ether"));})                                
          }
        else{
            toastr["error"]("Error in transfer");
          }
        })
      .on('error',(err)=>{
        if(err.message.indexOf('Signature')!=-1){
          toastr["error"]("Error: Not a valid Signature");
          return false;
        }else if(err.message.indexOf('recipient')!=-1){
          toastr["error"]("Error: Not an intended recipient");
          return false;
        }else if(err.message.indexOf('Insufficient')!=-1){
          toastr["error"]("Error: Insufficient funds");
          return false;
        }else{
          toastr["error"]("Error: Something went wrong");
          return false;
        }
      });  
    }
  else{
    toastr["error"]("Error: Please enter a valid signature");
    return false;
  }
  },
  "abi": [
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "recipientAddress",
          "type": "address"
        }
      ],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "signature",
          "type": "bytes"
        }
      ],
      "name": "claimPayment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isActive",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "recipient",
      "outputs": [
        {
          "internalType": "address payable",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "sender",
      "outputs": [
        {
          "internalType": "address payable",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}

$(function() {
  $(window).load(function() {
    App.init();
    toastr.options = {
      "positionClass": "toast-bottom-right",
      "preventDuplicates": true,
      "closeButton": true
    };
  });
});