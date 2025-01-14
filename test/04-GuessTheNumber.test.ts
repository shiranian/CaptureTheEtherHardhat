import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
     // Attacker makes the guess by sending 1 ether
    const tx = await target.guess(42, { value: utils.parseEther('1') });
    await tx.wait();

    
    const contractBalance = await provider.getBalance(target.address);
    // Check if the contract's balance is zero (challenge is complete)
    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
