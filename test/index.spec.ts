import { constants } from "ethers";
import { parseEther } from "ethers/lib/utils";

import { batchToTxBuilder } from "../src";
import { BatchFile, OperationType } from "../src/types";

describe("@morpho-labs/gnosis-tx-builder", () => {
  let txBuilderJson: BatchFile;
  beforeAll(() => {
    global.Date.now = jest.fn(() => 1665177409_513);

    txBuilderJson = {
      version: "1.0",
      chainId: "1",
      createdAt: Date.now(),
      meta: {
        name: "Transactions Batch",
        checksum: "0xcc15ad0f6efe4476b91fdb28019f8006198056434b8746f177b37f07bb3e86f8",
        description: "Created from @morpho-labs/gnosis-tx-builder",
        txBuilderVersion: "1.8.0",
        createdFromSafeAddress: constants.AddressZero,
        createdFromOwnerAddress: "",
      },
      transactions,
    };
  });
  const transactions = [
    {
      to: constants.AddressZero,
      operation: OperationType.DelegateCall,
      value: parseEther("1").toString(),
      data: "0x",
    },
  ];

  const safe = constants.AddressZero;

  describe("Should return correct object", () => {
    it("should create a correct tx builder file", async () => {
      const batchFile = batchToTxBuilder(safe, transactions);
      expect(batchFile).toEqual(txBuilderJson);
    });
    it("should set default chain id correctly", async () => {
      let batchFile = batchToTxBuilder(safe, transactions);
      expect(batchFile.chainId).toEqual("1");
      batchFile = batchToTxBuilder(safe, transactions, {});
      expect(batchFile.chainId).toEqual("1");
    });
    it("should set correctly the chain id", async () => {
      const batchFile = batchToTxBuilder(safe, transactions, { chainId: 123 });
      expect(batchFile.chainId).toEqual("123");
    });
    it("should overrides parameters correctly", async () => {
      const batchFile = batchToTxBuilder(safe, transactions, {
        name: "Name override",
        createdAt: 1000,
        description: "My mock description",
      });
      expect(batchFile.meta.name).toEqual("Name override");
      expect(batchFile.meta.description).toEqual("My mock description");
      expect(batchFile.createdAt).toEqual(1000);
    });
  });
});
