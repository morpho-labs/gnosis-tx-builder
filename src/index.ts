import { DEFAULT_OPTIONS } from "./constants";
import { Address, BatchTransaction, Options } from "./types";
import { addChecksum } from "./utils";

export const batchToTxBuilder = (
  safe: Address,
  transactions: BatchTransaction[],
  options: Options = {}
) =>
  addChecksum({
    version: "1.0",
    chainId: options.chainId?.toString() ?? "1",
    createdAt: options?.createdAt ?? Date.now(),
    meta: {
      name: options?.name ?? DEFAULT_OPTIONS.name,
      description: options?.description ?? DEFAULT_OPTIONS.description,
      txBuilderVersion: "1.8.0",
      createdFromSafeAddress: safe,
      createdFromOwnerAddress: "",
    },
    transactions,
  });
