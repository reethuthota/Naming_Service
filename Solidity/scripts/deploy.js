const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("ninja");
    //await domainContract.deployed();
  
    console.log("Contract deployed to:", await domainContract.getAddress());
  
    // CHANGE THIS DOMAIN TO SOMETHING ELSE! I don't want to see OpenSea full of bananas lol
    let txn = await domainContract.register("mango",  {value: hre.ethers.parseEther('0.1')});
    await txn.wait();
    console.log("Minted domain mango.ninja");
  
    txn = await domainContract.setRecord("mango", "Am I a mango or a ninja??");
    await txn.wait();
    console.log("Set record for mango.ninja");
    
  
    const address = await domainContract.getAddress("mango");
    console.log("Owner of domain mango:", address);
  
    const balance = await hre.ethers.provider.getBalance(domainContract.getAddress());
    console.log("Contract balance:", hre.ethers.formatEther(balance));
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