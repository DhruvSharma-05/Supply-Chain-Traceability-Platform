const hre = require("hardhat");

async function main() {
  console.log("🍎 Deploying Food Traceability Contract...");

  // Get the contract factory
  const FoodTraceability = await hre.ethers.getContractFactory("FoodTraceability");
  
  // Deploy the contract
  const foodTraceability = await FoodTraceability.deploy();
  
  // Wait for deployment
  await foodTraceability.waitForDeployment();

  const contractAddress = await foodTraceability.getAddress();
  console.log("✅ Food Traceability deployed to:", contractAddress);

  console.log("🎉 Deployment completed successfully!");
  console.log("Contract Address:", contractAddress);
  
  // Test basic contract functionality
  console.log("🔍 Testing contract...");
  
  // Check total products (should be 0 initially)
  const totalProducts = await foodTraceability.getTotalProducts();
  console.log("Total products:", totalProducts.toString());
  
  // Get deployer account info
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Check if deployer is registered as admin
  const stakeholder = await foodTraceability.getStakeholder(deployer.address);
  console.log("Deployer role:", stakeholder.role.toString());
  console.log("Deployer name:", stakeholder.name);
  
  console.log("");
  console.log("📋 Next Steps:");
  console.log("1. ✅ Local blockchain running");
  console.log("2. ✅ Smart contract deployed and working");
  console.log("3. 🔜 Build React frontend to interact with the contract");
  console.log("");
  console.log("🚀 Your Food Traceability Platform is ready for frontend development!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
