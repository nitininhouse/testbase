import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Replace with your actual contract address
const CONTRACT_ADDRESS = "0x8BE4649e86Ac2cEcA8429FdD0ec17ecE749D9C60";

// ABI matching your Counter contract
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newNumber",
        "type": "uint256"
      }
    ],
    "name": "setNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "number",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [newNumber, setNewNumber] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  // Initialize provider and check connection
  useEffect(() => {
    if (window.ethereum) {
      const initProvider = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          await handleConnect();
        }
      };
      initProvider();
    }
  }, []);

  // Fetch current number when contract changes
  useEffect(() => {
    const fetchNumber = async () => {
      if (contract) {
        const num = await contract.number();
        setCurrentNumber(num.toString());
      }
    };
    fetchNumber();
  }, [contract]);

  const handleConnect = async () => {
    try {
      setTxStatus('Connecting...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setSigner(signer);
      setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
      setIsConnected(true);
      setTxStatus('Connected successfully!');
      
      // Switch to Base Sepolia if needed
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14A34' }], // Base Sepolia chain ID
        });
      } catch (switchError) {
        // If chain isn't added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x14A34',
              chainName: 'Base Sepolia',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.base.org'],
              blockExplorerUrls: ['https://sepolia.basescan.org/']
            }],
          });
        }
      }
    } catch (error) {
      setTxStatus(`Connection error: ${error.message}`);
    }
  };

  const handleIncrement = async () => {
    if (!contract) return;
    
    try {
      setTxStatus('Sending increment transaction...');
      const tx = await contract.increment();
      setTxStatus('Transaction sent, waiting for confirmation...');
      
      await tx.wait();
      setTxStatus('Transaction confirmed!');
      
      // Refresh number
      const num = await contract.number();
      setCurrentNumber(num.toString());
    } catch (error) {
      setTxStatus(`Error: ${error.message}`);
    }
  };

  const handleSetNumber = async () => {
    if (!contract || !newNumber) return;
    
    try {
      setTxStatus('Sending setNumber transaction...');
      const tx = await contract.setNumber(parseInt(newNumber));
      setTxStatus('Transaction sent, waiting for confirmation...');
      
      await tx.wait();
      setTxStatus('Transaction confirmed!');
      
      // Refresh number
      const num = await contract.number();
      setCurrentNumber(num.toString());
      setNewNumber('');
    } catch (error) {
      setTxStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>On-Chain Counter</h1>
      
      {!isConnected ? (
        <button 
          onClick={handleConnect}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <div style={{ margin: '20px 0', fontSize: '24px' }}>
            Current Number: <strong>{currentNumber}</strong>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              onClick={handleIncrement}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
              Increment
            </button>
            
            <input
              type="number"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="Enter new number"
              style={{ padding: '10px', fontSize: '16px' }}
            />
            
            <button 
              onClick={handleSetNumber}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
              Set Number
            </button>
          </div>
          
          {txStatus && (
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#f0f0f0',
              borderRadius: '5px'
            }}>
              {txStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;