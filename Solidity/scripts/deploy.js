const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("CryptoConnect");
    //await domainContract.deployed();
  
    console.log("Contract deployed to:", await domainContract.getAddress());
  
    let txn = await domainContract.register("cloak",  {value: hre.ethers.parseEther('0.1')});
    await txn.wait();
    console.log("Minted domain cloak.CryptoConnect");
  
    txn = await domainContract.setRecord("cloak", "invisibility??");
    await txn.wait();
    console.log("Set record for cloak.CryptoConnect");
    
  
    const address = await domainContract.getAddress("cloak");
    console.log("Owner of domain cloak:", address);
  
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

//npx hardhat run scripts/deploy.js --network mumbai