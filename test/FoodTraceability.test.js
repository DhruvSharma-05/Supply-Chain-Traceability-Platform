const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const Role = {
  Admin: 0,
  Farmer: 1,
  Processor: 2,
  Distributor: 3,
  Retailer: 4,
  Consumer: 5,
};

const State = {
  Harvested: 0,
  Processed: 1,
  Shipped: 2,
  Distributed: 3,
  Retail: 4,
  Sold: 5,
};

const ZERO = "0x0000000000000000000000000000000000000000";

describe("FoodTraceability", function () {
  async function deployFixture() {
    const [owner, farmer, processor, distributor, retailer, consumer, other] =
      await ethers.getSigners();
    const Factory = await ethers.getContractFactory("FoodTraceability");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return {
      contract,
      owner,
      farmer,
      processor,
      distributor,
      retailer,
      consumer,
      other,
    };
  }

  async function withStakeholders() {
    const base = await deployFixture();
    const { contract, owner, farmer, processor, distributor, retailer, consumer } =
      base;
    await contract.connect(owner).registerStakeholder(farmer.address, Role.Farmer, "Green Valley Farm", "CA");
    await contract.connect(owner).registerStakeholder(processor.address, Role.Processor, "Fresh Foods", "NY");
    await contract.connect(owner).registerStakeholder(distributor.address, Role.Distributor, "Nat Distribution", "TX");
    await contract.connect(owner).registerStakeholder(retailer.address, Role.Retailer, "City Market", "FL");
    await contract.connect(owner).registerStakeholder(consumer.address, Role.Consumer, "John Doe", "WA");
    return base;
  }

  async function futureExpiry(daysAhead = 30) {
    return (await time.latest()) + daysAhead * 24 * 60 * 60;
  }

  // Creates one product as the farmer and returns its id (1 for the first).
  async function createOne(contract, farmer, expiry) {
    await contract
      .connect(farmer)
      .createFoodProduct(
        "Organic Apples",
        "Fruit",
        "Green Valley Farm, CA",
        expiry ?? (await futureExpiry()),
        "BATCH-001",
        ["USDA Organic", "Non-GMO"],
        true,
        ethers.parseEther("0.01")
      );
    return await contract.getTotalProducts();
  }

  describe("Deployment", function () {
    it("sets the deployer as the contract owner", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("registers the deployer as an active Admin stakeholder", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      const s = await contract.getStakeholder(owner.address);
      expect(s.role).to.equal(Role.Admin);
      expect(s.isActive).to.equal(true);
      expect(s.name).to.equal("System Administrator");
    });

    it("starts with zero products", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.getTotalProducts()).to.equal(0n);
    });
  });

  describe("registerStakeholder", function () {
    it("reverts when called by a non-owner", async function () {
      const { contract, farmer } = await loadFixture(deployFixture);
      await expect(
        contract.connect(farmer).registerStakeholder(farmer.address, Role.Farmer, "X", "Y")
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("registers a stakeholder with the correct fields", async function () {
      const { contract, owner, farmer } = await loadFixture(deployFixture);
      await contract.connect(owner).registerStakeholder(farmer.address, Role.Farmer, "Farm", "CA");
      const s = await contract.getStakeholder(farmer.address);
      expect(s.addr).to.equal(farmer.address);
      expect(s.role).to.equal(Role.Farmer);
      expect(s.name).to.equal("Farm");
      expect(s.location).to.equal("CA");
      expect(s.isActive).to.equal(true);
    });

    it("emits StakeholderRegistered", async function () {
      const { contract, owner, farmer } = await loadFixture(deployFixture);
      await expect(
        contract.connect(owner).registerStakeholder(farmer.address, Role.Farmer, "Farm", "CA")
      )
        .to.emit(contract, "StakeholderRegistered")
        .withArgs(farmer.address, Role.Farmer, "Farm");
    });
  });

  describe("createFoodProduct", function () {
    it("reverts for a non-registered caller", async function () {
      const { contract, other } = await loadFixture(deployFixture);
      await expect(
        contract.connect(other).createFoodProduct("A", "B", "C", await futureExpiry(), "BN", [], false, 0)
      ).to.be.revertedWith("Not a registered stakeholder");
    });

    it("reverts for a registered non-farmer", async function () {
      const { contract, processor } = await loadFixture(withStakeholders);
      await expect(
        contract.connect(processor).createFoodProduct("A", "B", "C", await futureExpiry(), "BN", [], false, 0)
      ).to.be.revertedWith("Unauthorized role");
    });

    it("creates a product with the expected fields and Harvested state", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      const expiry = await futureExpiry();
      await createOne(contract, farmer, expiry);

      const p = await contract.getProduct(1);
      expect(p.id).to.equal(1n);
      expect(p.name).to.equal("Organic Apples");
      expect(p.farmer).to.equal(farmer.address);
      expect(p.processor).to.equal(ZERO);
      expect(p.currentState).to.equal(State.Harvested);
      expect(p.expiryDate).to.equal(expiry);
      expect(p.harvestDate).to.be.greaterThan(0n);
      expect(p.isOrganic).to.equal(true);
      expect(p.price).to.equal(ethers.parseEther("0.01"));
    });

    it("tracks the product under the farmer and seeds history", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);

      expect(await contract.getUserProducts(farmer.address)).to.deep.equal([1n]);

      const history = await contract.getProductHistory(1);
      expect(history.length).to.equal(1);
      expect(history[0].from).to.equal(ZERO);
      expect(history[0].to).to.equal(farmer.address);
      expect(history[0].newState).to.equal(State.Harvested);
      expect(history[0].notes).to.equal("Product harvested and registered");
    });

    it("emits ProductCreated and increments ids", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await expect(
        contract
          .connect(farmer)
          .createFoodProduct(
            "Organic Apples",
            "Fruit",
            "Green Valley Farm, CA",
            await futureExpiry(),
            "BATCH-001",
            ["USDA Organic", "Non-GMO"],
            true,
            ethers.parseEther("0.01")
          )
      )
        .to.emit(contract, "ProductCreated")
        .withArgs(1n, farmer.address, "Organic Apples");
      await createOne(contract, farmer);
      expect(await contract.getTotalProducts()).to.equal(2n);
      expect((await contract.getProduct(2)).id).to.equal(2n);
    });
  });

  describe("updateProductState", function () {
    it("advances exactly one stage and appends history", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);

      await expect(
        contract.connect(farmer).updateProductState(1, State.Processed, "processed", "NY")
      )
        .to.emit(contract, "StateChanged")
        .withArgs(1n, State.Processed, farmer.address);

      expect((await contract.getProduct(1)).currentState).to.equal(State.Processed);
      expect((await contract.getProductHistory(1)).length).to.equal(2);
    });

    it("lets the contract owner update any product", async function () {
      const { contract, owner, farmer } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      await expect(
        contract.connect(owner).updateProductState(1, State.Processed, "by admin", "HQ")
      ).to.not.be.reverted;
    });

    it("reverts for a caller who is neither an owner-party nor the contract owner", async function () {
      const { contract, farmer, other } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      await expect(
        contract.connect(other).updateProductState(1, State.Processed, "x", "y")
      ).to.be.revertedWith("Not authorized to modify this product");
    });

    it("reverts when skipping a stage", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      await expect(
        contract.connect(farmer).updateProductState(1, State.Shipped, "skip", "x")
      ).to.be.revertedWith("Invalid state transition: must advance one stage");
    });

    it("reverts when moving backward", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      await contract.connect(farmer).updateProductState(1, State.Processed, "p", "x");
      await expect(
        contract.connect(farmer).updateProductState(1, State.Harvested, "back", "x")
      ).to.be.revertedWith("Invalid state transition: must advance one stage");
    });

    it("walks the full lifecycle and then treats Sold as terminal", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      for (const s of [State.Processed, State.Shipped, State.Distributed, State.Retail, State.Sold]) {
        await contract.connect(farmer).updateProductState(1, s, "step", "loc");
      }
      expect((await contract.getProduct(1)).currentState).to.equal(State.Sold);
      // No state beyond Sold exists, so any further update reverts.
      await expect(
        contract.connect(farmer).updateProductState(1, State.Sold, "again", "loc")
      ).to.be.revertedWith("Invalid state transition: must advance one stage");
    });
  });

  describe("transferProduct", function () {
    it("reverts when the recipient is not a registered stakeholder", async function () {
      const { contract, farmer, other } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      await expect(
        contract.connect(farmer).transferProduct(1, other.address, State.Processed, "n")
      ).to.be.revertedWith("Recipient not registered");
    });

    it("reverts on an invalid (non-sequential) transition", async function () {
      const { contract, farmer, distributor } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      await expect(
        contract.connect(farmer).transferProduct(1, distributor.address, State.Shipped, "n")
      ).to.be.revertedWith("Invalid state transition: must advance one stage");
    });

    it("reverts when the caller is not authorized for the product", async function () {
      const { contract, farmer, processor } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      await expect(
        contract.connect(processor).transferProduct(1, processor.address, State.Processed, "n")
      ).to.be.revertedWith("Not authorized to modify this product");
    });

    it("transfers to a processor, updating ownership, state, lists and history", async function () {
      const { contract, farmer, processor } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);

      await expect(
        contract.connect(farmer).transferProduct(1, processor.address, State.Processed, "handoff")
      )
        .to.emit(contract, "ProductOwnershipTransferred")
        .withArgs(1n, farmer.address, processor.address);

      const p = await contract.getProduct(1);
      expect(p.processor).to.equal(processor.address);
      expect(p.currentState).to.equal(State.Processed);
      expect(await contract.getUserProducts(processor.address)).to.deep.equal([1n]);

      const history = await contract.getProductHistory(1);
      const last = history[history.length - 1];
      expect(last.from).to.equal(farmer.address);
      expect(last.to).to.equal(processor.address);
      expect(last.location).to.equal("NY"); // recipient's registered location
    });

    it("assigns the correct ownership field for each recipient role along the chain", async function () {
      const { contract, farmer, processor, distributor, retailer, consumer } =
        await loadFixture(withStakeholders);
      await createOne(contract, farmer);

      await contract.connect(farmer).transferProduct(1, processor.address, State.Processed, "");
      await contract.connect(processor).transferProduct(1, distributor.address, State.Shipped, "");
      await contract.connect(distributor).transferProduct(1, retailer.address, State.Distributed, "");
      await contract.connect(retailer).transferProduct(1, consumer.address, State.Retail, "");

      const p = await contract.getProduct(1);
      expect(p.processor).to.equal(processor.address);
      expect(p.distributor).to.equal(distributor.address);
      expect(p.retailer).to.equal(retailer.address);
      expect(p.consumer).to.equal(consumer.address);
      expect(p.currentState).to.equal(State.Retail);
    });
  });

  describe("reportQualityIssue", function () {
    it("reverts for a non-stakeholder", async function () {
      const { contract, farmer, other } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      await expect(
        contract.connect(other).reportQualityIssue(1, "Contamination", "desc")
      ).to.be.revertedWith("Not a registered stakeholder");
    });

    it("reverts for a non-existent product", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await expect(
        contract.connect(farmer).reportQualityIssue(999, "X", "Y")
      ).to.be.revertedWith("Product does not exist");
    });

    it("emits QualityAlert for a valid report", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await createOne(contract, farmer);
      await expect(
        contract.connect(farmer).reportQualityIssue(1, "Contamination", "Found mold")
      )
        .to.emit(contract, "QualityAlert")
        .withArgs(1n, "Contamination", "Found mold");
    });
  });

  describe("views", function () {
    it("getProduct reverts for a non-existent product", async function () {
      const { contract } = await loadFixture(withStakeholders);
      await expect(contract.getProduct(1)).to.be.revertedWith("Product does not exist");
    });

    it("isExpired reflects the expiry date", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await createOne(contract, farmer, await futureExpiry(30));
      expect(await contract.isExpired(1)).to.equal(false);

      await time.increase(31 * 24 * 60 * 60);
      expect(await contract.isExpired(1)).to.equal(true);
    });

    it("getProductsByState returns ids grouped by their current state", async function () {
      const { contract, farmer } = await loadFixture(withStakeholders);
      await createOne(contract, farmer); // id 1, Harvested
      await createOne(contract, farmer); // id 2, Harvested
      await contract.connect(farmer).updateProductState(2, State.Processed, "", "");

      expect(await contract.getProductsByState(State.Harvested)).to.deep.equal([1n]);
      expect(await contract.getProductsByState(State.Processed)).to.deep.equal([2n]);
      expect(await contract.getProductsByState(State.Sold)).to.deep.equal([]);
    });
  });
});
