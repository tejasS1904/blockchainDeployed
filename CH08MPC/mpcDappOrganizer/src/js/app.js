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
        jQuery('#channel_balance').text(App.web3.utils.fromWei(res),"ether");
        jQuery('#contract_address').text(App.contracts.Payment._address);
      })
      
      App.web3.eth.getAccounts((err, accounts) => {  
        if(!err){
          App.currentAccount=accounts[0];
          App.contracts.Payment.methods.sender().call().then((res)=>{
            App.organizer=res;
            App.web3.eth.getBalance(App.organizer).then((res)=>{ jQuery('#organizer_balance').text(App.web3.utils.fromWei(res),"ether");});
            if(App.currentAccount==App.organizer){
              console.log('Organizer is connected');
              jQuery('#OrganizersForm').css('display','block');
              jQuery('#Signatures').css('display','block');              
            } 
          });
          App.contracts.Payment.methods.recipient().call().then((res)=>{
            App.worker=res;
            App.web3.eth.getBalance(App.worker).then((res)=>{ jQuery('#worker_balance').text(App.web3.utils.fromWei(res),"ether");});
            jQuery('#worker').val(App.worker);
          }); 
        }     
      });

      return App.bindEvents();
    },  
  
    bindEvents: function() {  
      $(document).on('click', '#sign', function(){
         App.handleSignature(jQuery('#worker').val(),jQuery('#amount').val());
      });
    }, 
  
    handleSignature:function(worker,amount){      
      if(worker!=App.worker){
        alert('Error in worker\'s address.')
        return false;
      }
      if(amount<=0){
        alert('Please correct the amount.');
        return false;
      }
      var weiamount=App.web3.utils.toWei(amount, 'ether');
      var message = App.constructPaymentMessage(App.contracts.Payment._address, weiamount);
      App.signMessage(message,amount);      
    },

    constructPaymentMessage:function(contractAddress, weiamount) {
      return App.web3.utils.soliditySha3(contractAddress,weiamount)
    },
  
    signMessage:function (message,amount) {      
      App.web3.eth.personal.sign(message, App.organizer, function(err, signature) {
        if(!err)
        {
          var box='<div class="check col-md-12 col-lg-12" style="position:absolute;margin-top:'+App.margin+'px;z-index:'+App.index+';left:'+App.left+'px">'+
                  '<span class="amount"><b>'+amount+' ETH </b></span>'+
                  '<p class="signature">'+signature+'</p>'+
                  '</div>';
          App.index=App.index+1;
          App.margin=App.margin+30;
          App.left=App.left+5;
          jQuery('#allchecks').append(box); 
        } 
        else{
          toastr["error"]("Error: Error in signing the signature");
          return false;
        }
      });
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
  