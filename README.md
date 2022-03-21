# Cashier problem

## Description

Build a cash register that gives customers back exact change on their purchase.

Change should be given back to the customer in descending order, biggest bills and coins first.

Your cashier module must provide three public functions:

- a `new` function to create a new cashier.
- a `get_current_cash` function that receives the cashier and returns all bills and coins currently in the cashier, in descending order.
- a `pay` function that:
  - receives the purchase price and the bills and coins the customer is giving to the cashier.
  - returns the list of bills and coins (in descending order) to give back to the customer as change and the updated cashier.

Don't worry about the performance of your solution. Focus on getting the provided tests to pass.

## Requirements

The [tests/cashier.spec.js](tests/cashier.spec.js) file should not be modified. If you would like to add your own unit tests, you
can add these in a separate file in the `tests` folder.

The `package.json` file should only be modified in order to add any third-party dependencies required for your solution. The `jest` and `babel` versions should not be changed.

Your solution must use/be compatible with `Node.js` version `15.5.1`.

## Tests

Run `npm install` to install all dependencies and then run `npm run test` to run the unit tests. These should all pass if your solution has been implemented correctly.