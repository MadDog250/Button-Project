import {ethers, waffle} from 'hardhat';
import chai from 'chai';
import {Button} from '../typechain-types';
import {Button__factory} from '../typechain-types/factories';
const {deployContract} = waffle;
const {expect, assert} = chai;


describe("Button", () => {

  let contract: Button;
  let owner;
  let addr1;
  let block;
  let contractBalance;

  //loads and deploys contract
  before(async () => {

    const Button = (await ethers.getContractFactory("Button")) as Button__factory;
    [owner, addr1] = await ethers.getSigners();
    contract = await Button.deploy();
    const provider = ethers.provider;
    block = await provider.getBlockNumber();
    console.log("block: ",block);
  });


  //test presses button with multiple accounts and checks that the treasure can only be claimed by last presser and after 3 blocks have passed
  describe("Press Button and Claim Treasure", () => {

    //checks fee and checks revert if incorrect fee is sent
    it("should make sure fee is .001 ether and emit ButtonPress event", async () => {
    [owner, addr1] = await ethers.getSigners();
    await expect(contract.press_button({value: ethers.utils.parseEther("1")})).to.emit(contract,"ButtonPress").withArgs(owner.address);
    await expect(contract.press_button({value: ethers.utils.parseEther(".01")})).to.be.revertedWith('incorrect fee')
    });

    //checks if others can press button
    it("should let other user press button", async () => {
      [owner, addr1] = await ethers.getSigners();
      await contract.connect(addr1).press_button({value: ethers.utils.parseEther("1")});
    });

    //checks revert if last presser tries to claim treasure too quickly
    it("should revert call to claim treasure due to insufficient number of block passings", async () => {
      [owner, addr1] = await ethers.getSigners();
      await expect(contract.connect(addr1).claim_treasure()).to.be.revertedWith("hasnt been 3 blocks");
      });

    //mines block
    it("mine", async () => {
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;
      await ethers.provider.send('evm_setNextBlockTimestamp', [timestampBefore+1]); 
      await ethers.provider.send('evm_mine',[timestampBefore+1]);
    });

    //mines block
    it("mine", async () => {
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;
      await ethers.provider.send('evm_setNextBlockTimestamp', [timestampBefore+1]); 
      await ethers.provider.send('evm_mine',[timestampBefore+1]);
    });

    //mines block
    it("mine", async () => {
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;
      await ethers.provider.send('evm_setNextBlockTimestamp', [timestampBefore+1]); 
      await ethers.provider.send('evm_mine',[timestampBefore+1]);
    });

    //checks revert if three blocks have passed but claimer is not last presser
    it("should revert call to claim treasure due not being last presser", async () => {
      await expect(contract.claim_treasure()).to.be.revertedWith("not last presser");
    });

    //checks treasure can be claimed after 3 blocks and last presser calls function
    it("should send balance to last presser and emit ClaimTreasure event ", async () => {
      [owner, addr1] = await ethers.getSigners();
      await expect(contract.connect(addr1).claim_treasure()).to.emit(contract,"ClaimTreasure").withArgs(addr1.address,0);;
    });

    //checks contract balance is emptied
    it("contract balance should be zero after treasure is claimed", async () => {
        contractBalance = await ethers.provider.getBalance(contract.address);
        expect(contractBalance).to.equal(0);
    });

  

  });

  //prints block number and contract balance for easy viewing
  afterEach(async () => {
    
    block = await ethers.provider.getBlockNumber();
    console.log("block: ",block);
    contractBalance = await ethers.provider.getBalance(contract.address);
    console.log("contract: ",ethers.utils.formatEther(contractBalance));
  });




});
