export type Address = string;

export interface Options {
  chainId?: number;
  name?: string;
  description?: string;
  createdAt?: number;
  txBuilderVersion?: string;
}

export interface BatchFile {
  version: string;
  chainId: string;
  createdAt: number;
  meta: BatchFileMeta;
  transactions: BatchTransaction[];
}

export interface BatchFileMeta {
  txBuilderVersion?: string;
  checksum?: string;
  createdFromSafeAddress?: Address;
  createdFromOwnerAddress?: Address;
  name: string;
  description?: string;
}

export interface BatchTransaction {
  to: Address;
  value: string;
  data?: string | null;
  contractMethod?: ContractMethod;
  contractInputsValues?: { [key: string]: string };
}

export interface ContractMethod {
  inputs: ContractInput[];
  name: string;
  payable: boolean;
}

export interface ContractInput {
  internalType: string;
  name: string;
  type: string;
  components?: ContractInput[];
}
