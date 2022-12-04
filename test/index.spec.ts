import { constants } from "ethers";
import { parseEther } from "ethers/lib/utils";

import { TxBuilder } from "../src";
import { BatchFile } from "../src/types";

describe("@morpho-labs/gnosis-tx-builder", () => {
  let txBuilderJson: BatchFile;
  beforeAll(() => {
    global.Date.now = jest.fn(() => 1665179771184);

    txBuilderJson = {
      version: "1.0",
      chainId: "1",
      createdAt: Date.now(),
      meta: {
        name: "Transactions Batch",
        checksum: "0x0e8bc7db05f5d3272681a16a52c08de6f1400b8afd76d332e771e5473bcca49e",
        description: "Created from @morpho-labs/gnosis-tx-builder",
        txBuilderVersion: "1.10.0",
        createdFromSafeAddress: constants.AddressZero,
        createdFromOwnerAddress: "",
      },
      transactions,
    };
  });
  const transactions = [
    {
      to: constants.AddressZero,
      value: parseEther("1").toString(),
      data: "0x",
    },
  ];

  const safe = constants.AddressZero;

  describe("Should return correct object", () => {
    it("should create a correct tx builder file", async () => {
      const batchFile = TxBuilder.batch(safe, transactions);
      expect(batchFile).toEqual(txBuilderJson);
    });
    it("should set default chain id correctly", async () => {
      let batchFile = TxBuilder.batch(safe, transactions);
      expect(batchFile.chainId).toEqual("1");
      batchFile = TxBuilder.batch(safe, transactions, {});
      expect(batchFile.chainId).toEqual("1");
    });
    it("should set correctly the chain id", async () => {
      const batchFile = TxBuilder.batch(safe, transactions, { chainId: 123 });
      expect(batchFile.chainId).toEqual("123");
    });
    it("should overrides parameters correctly", async () => {
      const batchFile = TxBuilder.batch(safe, transactions, {
        name: "Name override",
        createdAt: 1000,
        description: "My mock description",
        txBuilderVersion: "1.0.0",
      });
      expect(batchFile.meta.name).toEqual("Name override");
      expect(batchFile.meta.description).toEqual("My mock description");
      expect(batchFile.meta.txBuilderVersion).toEqual("1.0.0");
      expect(batchFile.createdAt).toEqual(1000);
    });
  });
});
