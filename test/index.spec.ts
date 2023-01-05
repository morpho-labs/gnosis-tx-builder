import { constants } from "ethers";
import { parseEther } from "ethers/lib/utils";

import { TxBuilder } from "../src";
import {
  ChecksumParsingError,
  ErrorCode,
  ParsingError,
  TransactionParsingError,
} from "../src/errors";
import { BatchFile } from "../src/types";
import { addChecksum } from "../src/utils";

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

  describe("Should correctly parse a batch file", () => {
    it("should return an error if the checksum is invalid", () => {
      expect(() =>
        TxBuilder.parse(
          JSON.stringify({
            ...txBuilderJson,
            meta: { ...txBuilderJson.meta, checksum: "invalid checksum" },
          })
        )
      ).toThrow(new ChecksumParsingError("invalid checksum", txBuilderJson.meta.checksum));
    });

    it("should return an error if the batch file can't be parsed", () => {
      // not an object
      expect(() => TxBuilder.parse(JSON.stringify(["not an object"]))).toThrow(
        new ParsingError(ErrorCode.wrongFormat)
      );

      expect(() =>
        //@ts-expect-error object without transactions
        TxBuilder.parse(JSON.stringify(addChecksum({ ...txBuilderJson, transactions: undefined })))
      ).toThrow(new ParsingError(ErrorCode.wrongFormat));

      expect(() =>
        TxBuilder.parse(
          //@ts-expect-error transactions not an array
          JSON.stringify(addChecksum({ ...txBuilderJson, transactions: "not an array" }))
        )
      ).toThrow(new ParsingError(ErrorCode.wrongFormat));
    });
    it("should return an error if a transaction doesn't have the correct type", () => {
      expect(() =>
        TxBuilder.parse(
          //@ts-expect-error wrong transaction type
          JSON.stringify(addChecksum({ ...txBuilderJson, transactions: ["not an object"] }))
        )
      ).toThrow(new TransactionParsingError(0));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            //@ts-expect-error wrong transaction type for property "to"
            addChecksum({ ...txBuilderJson, transactions: [{ ...transactions[0], to: 123 }] })
          )
        )
      ).toThrow(new TransactionParsingError(0, "to"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            //@ts-expect-error wrong transaction type for property "value"
            addChecksum({ ...txBuilderJson, transactions: [{ ...transactions[0], value: 123 }] })
          )
        )
      ).toThrow(new TransactionParsingError(0, "value"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            //@ts-expect-error wrong transaction type for property "data"
            addChecksum({ ...txBuilderJson, transactions: [{ ...transactions[0], data: 123 }] })
          )
        )
      ).toThrow(new TransactionParsingError(0, "data"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            addChecksum({
              ...txBuilderJson,
              //@ts-expect-error wrong transaction type for property "contractInputsValues"
              transactions: [{ ...transactions[0], contractInputsValues: "not an object" }],
            })
          )
        )
      ).toThrow(new TransactionParsingError(0, "contractInputsValues"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            addChecksum({
              ...txBuilderJson,
              transactions: [
                //@ts-expect-error wrong transaction type for property "contractInputsValues"
                { ...transactions[0], contractInputsValues: { string: "", notAString: 0 } },
              ],
            })
          )
        )
      ).toThrow(new TransactionParsingError(0, "contractInputsValues"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            addChecksum({
              ...txBuilderJson,
              //@ts-expect-error wrong transaction type for property "contractMethod"
              transactions: [{ ...transactions[0], contractMethod: "not an object" }],
            })
          )
        )
      ).toThrow(new TransactionParsingError(0, "contractMethod"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            addChecksum({
              ...txBuilderJson,
              transactions: [
                //@ts-expect-error wrong transaction type for property "contractMethod.name"
                { ...transactions[0], contractMethod: { inputs: [], name: 0, payable: true } },
              ],
            })
          )
        )
      ).toThrow(new TransactionParsingError(0, "contractMethod"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            addChecksum({
              ...txBuilderJson,
              transactions: [
                {
                  ...transactions[0],
                  //@ts-expect-error wrong transaction type for property "contractMethod.payable"
                  contractMethod: { inputs: [], name: "string", payable: "not a boolean" },
                },
              ],
            })
          )
        )
      ).toThrow(new TransactionParsingError(0, "contractMethod"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            addChecksum({
              ...txBuilderJson,
              transactions: [
                {
                  ...transactions[0],
                  //@ts-expect-error wrong transaction type for property "contractMethod.inputs"
                  contractMethod: { inputs: ["not an object"], name: "string", payable: true },
                },
              ],
            })
          )
        )
      ).toThrow(new TransactionParsingError(0, "contractMethod"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            addChecksum({
              ...txBuilderJson,
              transactions: [
                {
                  ...transactions[0],
                  contractMethod: {
                    //@ts-expect-error wrong transaction type for property "contractMethod.inputs[0].name"
                    inputs: [{ name: 0, type: "", components: [], internalType: "" }],
                    name: "string",
                    payable: true,
                  },
                },
              ],
            })
          )
        )
      ).toThrow(new TransactionParsingError(0, "contractMethod"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            addChecksum({
              ...txBuilderJson,
              transactions: [
                {
                  ...transactions[0],
                  contractMethod: {
                    //@ts-expect-error wrong transaction type for property "contractMethod.inputs[0].type"
                    inputs: [{ name: "", type: 0, components: [], internalType: "" }],
                    name: "string",
                    payable: true,
                  },
                },
              ],
            })
          )
        )
      ).toThrow(new TransactionParsingError(0, "contractMethod"));
      expect(() =>
        TxBuilder.parse(
          JSON.stringify(
            addChecksum({
              ...txBuilderJson,
              transactions: [
                {
                  ...transactions[0],
                  contractMethod: {
                    //@ts-expect-error wrong transaction type for property "contractMethod.inputs[0].internalType"
                    inputs: [{ name: "", type: "", components: [], internalType: 0 }],
                    name: "string",
                    payable: true,
                  },
                },
              ],
            })
          )
        )
      ).toThrow(new TransactionParsingError(0, "contractMethod"));
    });
    it("should parse correcly several transactions", () => {
      const batchFileMock = addChecksum({
        ...txBuilderJson,
        transactions: [
          {
            to: "0x0001",
            value: "123",
            data: "0x1234",
          },
          {
            to: "0x0002",
            value: "456",
            data: "0x4567",
            contractInputsValues: {
              key1: "value1",
              key2: "value2",
            },
            contractMethod: {
              inputs: [
                {
                  name: "name",
                  type: "type",
                  components: [{ name: "name2", type: "type2", internalType: "intType2" }],
                  internalType: "intType",
                },
              ],
              name: "string",
              payable: true,
            },
          },
        ],
      });

      expect(() => TxBuilder.parse(JSON.stringify(batchFileMock))).not.toThrow();
      expect(TxBuilder.parse(JSON.stringify(batchFileMock))).toEqual(batchFileMock.transactions);
    });
  });
});
