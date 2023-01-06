# Gnosis Tx-Builder from a script

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> ⚡🚀 Transform an array of transactions in a Transaction builder json for the Gnosis UX, based on ethers-js

## Install

```bash
npm install @morpho-labs/gnosis-tx-builder
```

```bash
yarn add @morpho-labs/gnosis-tx-builder
```

## Usage

### Generate JSON

Generate a Tx builder json file:

```typescript
import { constants } from "ethers";
import fs from "fs";

import TxBuilder, {
  ParsingError,
  ChecksumParsingError,
  TransactionParsingError,
} from "@morpho-labs/gnosis-tx-builder";

const safeAddress = "0x12341234123412341234123412341232412341234";

const transactions = [
  {
    to: constants.AddressZero,
    value: parseEther("1").toString(),
    data: "0x",
  },
];

const batchJson = TxBuilder.batch(safeAddress, transactions);

// dump into a file
fs.writeFileSync("batchTx.json", JSON.stringify(batchJson, null, 2));
```

Now, with the json file, go to the Gnosis dApp, and select Transaction Builder app

[![Transaction builder][txbuilder-img]][gnosis-url]

And then, drag and drop the `batchTx.json` file

![img.png](img/dnd.png)

And tada! 🎉🎉

### Parse JSON

Parse transactions from a Tx Builder JSON file:

```typescript
import fs from "fs";

import TxBuilder from "@morpho-labs/gnosis-tx-builder";

// read from a file
const batchJson = fs.readFileSync("batchTx.json");

try {
  const batch = TxBuilder.parse(batchJson);

  console.log(batch);
  /*
    [
        {
            to: "0x000000000000000000000000",
            value: "1000000000000000000",
            data: "0x",
        },
    ]
    */
} catch (e: ParsingError) {
  if (e instanceof ChecksumParsingError) console.debug(e.params); // { code: ErrorCode; expected: string; computed: string }
  if (e instanceof TransactionParsingError) console.debug(e.params); // { code: ErrorCode; index: number; parameter?: string }
  console.debug(e.params); // { code: ErrorCode }
}
```

#### Error Codes

You can import the error codes from the package

```typescript
import { ErrorCode } from "@morpho-labs/gnosis-tx-builder";
```

Available codes

```typescript
export enum ErrorCode {
  wrongFormat = "WRONG_FORMAT", //The json file don't match the expected format ({ meta:..., transactions: [...] })
  wrongTxFormat = "WRONG_TRANSACTION_FORMAT", //The transaction at index `index` doesn't match the expected format (not an object or parameter `parameter` doesn't have the right type)
  invalidChecksum = "INVALID_CHECKSUM", //The computed checksum doesn't match the expected one (the one in the file)
}
```

[txbuilder-img]: img/tx-builder.png
[gnosis-url]: https://gnosis-safe.io/app
[build-img]: https://github.com/morpho-labs/gnosis-tx-builder/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/morpho-labs/gnosis-tx-builder/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/@morpho-labs/gnosis-tx-builder
[downloads-url]: https://www.npmtrends.com/@morpho-labs/gnosis-tx-builder
[npm-img]: https://img.shields.io/npm/v/@morpho-labs/gnosis-tx-builder
[npm-url]: https://www.npmjs.com/package/@morpho-labs/gnosis-tx-builder
[issues-img]: https://img.shields.io/github/issues/morpho-labs/gnosis-tx-builder
[issues-url]: https://github.com/morpho-labs/gnosis-tx-builder/issues
[codecov-img]: https://codecov.io/gh/morpho-labs/gnosis-tx-builder/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/morpho-labs/gnosis-tx-builder
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
