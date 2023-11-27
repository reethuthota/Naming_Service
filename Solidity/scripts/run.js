  // Hardhat will create a local Ethereum network for us, but just for this contract. 
  // Then after the script completes, it will destroy that local network. 
  //So, every time you run the contract it will be a fresh blockchain.
  
  const main = async () => {
    const [owner, superCoder] = await hre.ethers.getSigners();
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("ninja");
    //await domainContract.deployed();
  
    console.log("Contract owner:", owner.address);
  
    // Let's be extra generous with our payment (we're paying more than required)
    let txn = await domainContract.register("a16z",  {value: hre.ethers.parseEther('1234')});
    await txn.wait();
  
    // How much money is in here?
    const balance = await hre.ethers.provider.getBalance(domainContract.getAddress());
    console.log("Contract balance:", hre.ethers.formatEther(balance));
  
    // Quick! Grab the funds from the contract! (as superCoder)
    try {
      txn = await domainContract.connect(superCoder).withdraw();
      await txn.wait();
    } catch(error){
      console.log("Could not rob contract");
    }
  
    // Let's look in their wallet so we can compare later
    let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
    console.log("Balance of owner before withdrawal:", hre.ethers.formatEther(ownerBalance));
  
    // Oops, looks like the owner is saving their money!
    txn = await domainContract.connect(owner).withdraw();
    await txn.wait();
    
    // Fetch balance of contract & owner
    const contractBalance = await hre.ethers.provider.getBalance(domainContract.getAddress());
    ownerBalance = await hre.ethers.provider.getBalance(owner.address);
  
    console.log("Contract balance after withdrawal:", hre.ethers.formatEther(contractBalance));
    console.log("Balance of owner after withdrawal:", hre.ethers.formatEther(ownerBalance));
  }
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();