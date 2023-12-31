import React, { useEffect, useState } from "react";
import './styles/App.css';
import githubLogo from './assets/github_logo.svg';
import { ethers } from "ethers";
import contractABI from './utils/contractABI.json';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks.js';

// Add the domain you will be minting
const tld = '.CryptoConnect';
const CONTRACT_ADDRESS = '0xfF3b91029F7965F894BaC1bd5F0Fe927CB7f951F';

const App = () => {
	const [network, setNetwork] = useState('');
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [currentAccount, setCurrentAccount] = useState('');
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');
	const [mints, setMints] = useState([]);

	const connectWallet = async () => {
		try {
			const { ethereum } = window; //getting ethereum object (wallets) in your window (browser)

			//if etheruem object isn't found, alert is generated 
			if (!ethereum) { 
				alert("Get MetaMask -> https://metamask.io/"); 
				return;
			}

			const accounts = await ethereum.request({ method: "eth_requestAccounts" }); //Requesting the accounts presents from the ethereum wallet

			console.log("Connected", accounts[0]); 
			setCurrentAccount(accounts[0]); //Connecting to the first account present
		} catch (error) { //if there is any error while connecting to the wallet, you catch it
			console.log(error);
		}
	}

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Mumbai testnet
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
				});
			} catch (error) {
				// This error code means that the chain we want has not been added to MetaMask
				// In this case we ask the user to add it to their MetaMask
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
									chainId: '0x13881',
									chainName: 'Polygon Mumbai Testnet',
									rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
									nativeCurrency: {
										name: "Mumbai Matic",
										symbol: "MATIC",
										decimals: 18
									},
									blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
								},
							],
						});
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			// If window.ethereum is not found then MetaMask is not installed
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		}
	}

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		// Checking if ethereum object (wallet) is found on browser
		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		} else {
			console.log('We have the ethereum object', ethereum);
		}

		// Used to retrieve the accounts connected to the user's wallet. 
		const accounts = await ethereum.request({ method: 'eth_accounts' });

		// Checking if there are any authorized accounts that are found
		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account:', account);
			setCurrentAccount(account); //Setting account to the first authorised account found
		} else {
			console.log('No authorized account found');
		}

		// Check the user's network chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		ethereum.on('chainChanged', handleChainChanged); // event listener to detect changes in user's network. Triggers handleChainChanged function

		// Reload the page when they change networks
		function handleChainChanged(_chainId) {
			window.location.reload();
		}
	};

	const withdrawFunds = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum); // This helps in interaction with the Ethereum blockchain through ethereum object (metamask)
				const signer = provider.getSigner();  // This retrieves a signer object from the provider. signer is used to authorise transactions
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer); // Creates an instance of the smart contract

				const tx = await contract.withdraw(); // It calls the withdraw function on the smart contract instance
				await tx.wait(); // Waits for transation to be processed on the ethereum blockchain

				console.log("Funds withdrawn successfully!");
			}
		} catch (error) {
			console.error("Error withdrawing funds:", error);
		}
	};

	const mintDomain = async () => {
		// Don't run if the domain is empty
		if (!domain) { return }
		// Alert the user if the domain is too short or long
		if (domain.length < 3) {
			alert('Domain must be at least 3 characters long');
			return;
		}
		if (domain.length > 10) {
			alert('Domain must be less than 10 characters long');
			return;
		}

		// Calculate price based on length of domain (change this to match your contract)	
		// 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
		const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
		console.log("Minting domain", domain, "with price", price);
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum); // This helps in interaction with the Ethereum blockchain through ethereum object (metamask)
				const signer = provider.getSigner(); // This retrieves a signer object from the provider. signer is used to authorise transactions
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer); // Creates an instance of the smart contract

				console.log("Going to pop wallet now to pay gas...")
				// Register the domain
				let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
				const receipt = await tx.wait(); // Wait for the transaction to be mined

				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log("Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash);

					// Set the record for the domain
					tx = await contract.setRecord(domain, record);
					await tx.wait();
					console.log("Record set! https://mumbai.polygonscan.com/tx/" + tx.hash);

					// Call fetchMints after 2 seconds
					setTimeout(() => {
						fetchMints();
					}, 2000);

					setRecord('');
					setDomain('');
				} else {
					alert("Transaction failed! Please try again");
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	const fetchMints = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

				// Get all the domain names from our contract
				const names = await contract.getAllNames();

				// For each name, get the record and the address
				const mintRecords = await Promise.all(names.map(async (name) => {
					const mintRecord = await contract.records(name);
					const owner = await contract.domains(name);
					return {
						id: names.indexOf(name),
						name: name,
						record: mintRecord,
						owner: owner,
					};
				}));

				console.log("MINTS FETCHED ", mintRecords);
				setMints(mintRecords);
			}
		} catch (error) {
			console.log(error);
		}
	}

	// This will run any time currentAccount or network are changed
	useEffect(() => {
		if (network === 'Polygon Mumbai Testnet') {
			fetchMints();
		}
	}, [currentAccount, network]);

	const updateDomain = async () => {
		if (!record || !domain) { return }
		setLoading(true); // Indicates that some operation is in progress
		console.log("Updating domain", domain, "with record", record);
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

				let tx = await contract.setRecord(domain, record); // Calls the setRecord function from contracts
				await tx.wait();
				console.log("Record set https://mumbai.polygonscan.com/tx/" + tx.hash);

				fetchMints();
				setRecord('');
				setDomain('');
			}
		} catch (error) {
			console.log(error);
		}
		setLoading(false); // 
	}

	// Render methods
	// Renders the GIF and the connect wallet button
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<img src="https://media.giphy.com/media/KK7yJR1ejwr1OFYAgm/giphy.gif" alt="gif" />
			{/* Call the connectWallet function we just wrote when the button is clicked */}
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	);

	// Renders a list of recently minted domains if there is a connected account
	const renderMints = () => {
		if (currentAccount && mints.length > 0) {
			return (
				<div className="mint-container">
					<p className="subtitle"> Recently minted domains!</p>
					<div className="mint-list">
						{mints.map((mint, index) => {
							return (
								<div className="mint-item" key={index}>
									<div className='mint-row'>
										<a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
											<p className="underlined">{' '}{mint.name}{tld}{' '}</p>
										</a>
										{/* If mint.owner is currentAccount, add an "edit" button*/}
										{mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
											<button className="edit-button" onClick={() => editRecord(mint.name)}>
												<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
											</button>
											:
											null
										}
									</div>
									<p> {mint.record} </p>
								</div>)
						})}
					</div>
				</div>);
		}
	};

	// This will take us into edit mode and show us the edit buttons!
	const editRecord = (name) => {
		console.log("Editing record for", name);
		setEditing(true);
		setDomain(name);
	}

	// Form to enter domain name and data
	const renderInputForm = () => {
		if (network !== 'Polygon Mumbai Testnet') {
			return (
				<div className="connect-wallet-container">
					<p>Please connect to Polygon Mumbai Testnet</p>
					<button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
				</div>
			);
		}

		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>

				<input
					type="text"
					value={record}
					placeholder='tell me about yourself'
					onChange={e => setRecord(e.target.value)}
				/>
				{/* If the editing variable is true, return the "Set record" and "Cancel" button */}
				{editing ? (
					<div className="button-container">
						{/* This will call the updateDomain function we just made */}
						<button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
							Set record
						</button>
						{/* This will let us get out of editing mode by setting editing to false */}
						<button className='cta-button mint-button' onClick={() => { setEditing(false) }}>
							Cancel
						</button>
					</div>
				) : (
					// If editing is not true, the mint button will be returned instead
					<div>
						<button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
							Mint
						</button>
						<button className='cta-button mint-button' onClick={withdrawFunds}>
							Withdraw Funds
						</button>
					</div>
				)}
			</div>
		);
	}

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<header>
						<div className="left">
							<p className="title">CryptoConnect Naming Service💰🤑</p>
							<p className="subtitle">Your immortal API on the blockchain!</p>
						</div>
						{/* Display a logo and wallet connection status*/}
						<div className="right">
							<img alt="Network logo" className="logo" src={network.includes("Polygon") ? polygonLogo : ethLogo} />
							{currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p>}
						</div>
					</header>
				</div>

				{!currentAccount && renderNotConnectedContainer()}
				{currentAccount && renderInputForm()}
				{mints && renderMints()}

				<div className="footer-container">
					<img alt="Github Logo" className="github-logo" src={githubLogo} />
					<a
						className="footer-text"
						href={'https://github.com/reethuthota'}
						target="_blank"
						rel="noreferrer"
					>{`@reethuthota`}</a>
				</div>
			</div>
		</div>
	);


};

export default App;