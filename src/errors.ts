import { ContractInput } from "./types";

export enum ErrorCode {
  wrongFormat = "WRONG_FORMAT",
  wrongTxFormat = "WRONG_TRANSACTION_FORMAT",
  invalidChecksum = "INVALID_CHECKSUM",
}

export class ParsingError extends Error {
  constructor(public code: ErrorCode) {
    super(`Cannot parse transactions.\nError code: ${code}`);
    this.name = "TxBuilderParsingError";
  }
}

export class TransactionParsingError extends ParsingError {
  constructor(public index: number, public parameter?: string) {
    super(ErrorCode.wrongTxFormat);
    this.message = `Cannot parse transaction at index ${index}.`;
    if (parameter) this.message += `\nParameter: ${parameter}`;
  }
}

export class ChecksumParsingError extends ParsingError {
  constructor(expected?: string, computed?: string) {
    super(ErrorCode.invalidChecksum);
    this.message = `Invalid checksum.\nExpected: ${expected}\nComputed: ${computed}`;
  }
}

export const validateContractMethod = (contractMethod: any, error: TransactionParsingError) => {
  if (contractMethod === undefined) return contractMethod;
  if (typeof contractMethod !== "object") throw error;

  const { inputs, name, payable } = contractMethod;

  if (typeof payable !== "boolean") throw error;
  if (typeof name !== "string") throw error;
  if (!Array.isArray(inputs)) throw error;
  if (!inputs.every((input) => validateContractInput(input, error))) throw error;
  return { inputs, name, payable };
};

const validateContractInput = (
  contractInput: any,
  error: TransactionParsingError
): ContractInput => {
  if (typeof contractInput !== "object") throw error;
  const { internalType, name, type, components } = contractInput;

  if (typeof internalType !== "string") throw error;
  if (typeof name !== "string") throw error;
  if (typeof type !== "string") throw error;

  if (components === undefined) return { internalType, name, type };
  if (!Array.isArray(components)) throw error;
  return {
    internalType,
    name,
    type,
    components: components.map((component) => validateContractInput(component, error)),
  };
};
