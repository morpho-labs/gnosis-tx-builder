import { DEFAULT_OPTIONS } from "./constants";
import {
  ChecksumParsingError,
  ErrorCode,
  ParsingError,
  TransactionParsingError,
  validateContractMethod,
} from "./errors";
import { Address, BatchTransaction, Options } from "./types";
import { addChecksum, calculateChecksum } from "./utils";

export default class TxBuilder {
  static batch = (safe: Address, transactions: BatchTransaction[], options: Options = {}) =>
    addChecksum({
      version: "1.0",
      chainId: options.chainId?.toString() ?? "1",
      createdAt: options.createdAt ?? Date.now(),
      meta: {
        name: options.name ?? DEFAULT_OPTIONS.name,
        description: options.description ?? DEFAULT_OPTIONS.description,
        txBuilderVersion: options.txBuilderVersion ?? DEFAULT_OPTIONS.txBuilderVersion,
        createdFromSafeAddress: safe,
        createdFromOwnerAddress: "",
      },
      transactions,
    });

  static parse = (batch: string): BatchTransaction[] => {
    const parsedBatch = JSON.parse(batch);
    if (
      Array.isArray(parsedBatch) ||
      !parsedBatch.transactions ||
      !Array.isArray(parsedBatch.transactions)
    )
      throw new ParsingError(ErrorCode.wrongFormat);
    const checksum = calculateChecksum(parsedBatch);
    if (!parsedBatch.meta?.checksum || !checksum || checksum !== parsedBatch.meta.checksum)
      throw new ChecksumParsingError(parsedBatch.meta.checksum, checksum);

    return (parsedBatch.transactions as any[]).map((tx: any, i) => {
      if (typeof tx !== "object") throw new TransactionParsingError(i);
      const { to, value, data, contractMethod, contractInputsValues } = tx;
      if (typeof to !== "string") throw new TransactionParsingError(i, "to");
      if (typeof value !== "string") throw new TransactionParsingError(i, "value");
      if (data !== null && data !== undefined && typeof data !== "string")
        throw new TransactionParsingError(i, "data");
      if (
        contractInputsValues !== undefined &&
        (typeof contractInputsValues !== "object" ||
          !Object.values(contractInputsValues).every((v) => typeof v === "string"))
      )
        throw new TransactionParsingError(i, "contractInputsValues");

      const contractMethodError = new TransactionParsingError(i, "contractMethod");

      const validatedContractMethod = validateContractMethod(contractMethod, contractMethodError);
      return { to, value, data, contractMethod: validatedContractMethod, contractInputsValues };
    });
  };
}
