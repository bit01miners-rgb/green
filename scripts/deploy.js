
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const GreenToken = await hre.ethers.getContractFactory("GreenToken");
    const token = await GreenToken.deploy();

    await token.waitForDeployment();

    console.log("GreenToken deployed to:", await token.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
