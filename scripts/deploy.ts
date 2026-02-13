
import hre from "hardhat";
const { ethers } = hre as any;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const GreenToken = await ethers.getContractFactory("GreenToken");
    const token = await GreenToken.deploy();

    await token.waitForDeployment();

    console.log("GreenToken deployed to:", await token.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
