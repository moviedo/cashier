import _ from 'lodash'

/**
 * creates a new cashier
 * takes in a currency, e.g. $
 */
export function newCashier(currency) {
  const denominations = {
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
    '2': 0,
    '1': 0,
    '0.5': 0,
    '0.25': 0,
    '0.10': 0,
    '0.05': 0,
    '0.01': 0,
  }

  if (_.isArray(currency)) {
    currency.forEach(item => denominations[`${item}`] = ++denominations[`${item}`]) 
  }

  return denominations
}

/**
 * Receives the cashier and returns a list with all the bills and coins currently in the cashier, in descending order.
 *    Output example: [100, 50, 50, 5, 2, 1, 1, 0.05, 0.01, 0.01]
 */
export function getCurrentCash(cashier) {
  const list = _.reduce(cashier, (acc, value, key) => {
    if (value > 0) {
      Array(value).fill(0).forEach(() => acc.push(parseFloat(key)))
    }

    return acc
  }, [])

  return _.sortBy(list).reverse()
}

/**
 * Receives the cashier, the purchase price and the bills and coins received as payment.
 * 
 * For example, to pay $12 with a $10 bill and a $5 bill you would call:
 *   pay(cashier, 12, [10, 5])
 
 * The result can be:
 * - {success: true, cashier, change: [10, 5, 2]}, if we can give change back to the customer. The result contains:
 *    - cashier: the updated cashier.
 *    - change: the list of the bills and coins we gave back as change, in descending order.
 * - {success: false, cashier, error: "NOT ENOUGH CHANGE"}, if we can't give change back.
 * - {success: false, cashier, error: "PAID LESS THAN PRICE"}, if the customer paid too little.
 * - {success: false, cashier, error: "INVALID DENOMINATION"}, if the customer paid with an invalid bill or coin.
 */
export function pay(cashier, purchasePrice, purchaseBills) {
  if (!hasValidDenominations(purchaseBills)) {
    return {success: false, cashier, error: 'INVALID DENOMINATION'}
  } else if (getCurrencyValue(purchaseBills) < purchasePrice) {
    return {success: false, cashier, error: 'PAID LESS THAN PRICE'}
  }
  
  try {
    const {cashier: updateCashier, change} = getChange(
      newCashier(purchaseBills.concat(getCurrentCash(cashier))), 
      getCurrencyValue(purchaseBills) - purchasePrice
    )

    return {success: true, cashier: updateCashier, change}
  } catch(e) {
    return {success: false, cashier, error: 'NOT ENOUGH CHANGE'} 
  }
}

function getCurrencyValue(purchaseBills=[]) {
  return purchaseBills.reduce((currency, acc) => acc + currency, 0)
}

function hasValidDenominations(purchaseBills=[]) {
  const validDenomations = newCashier('$')

  return purchaseBills.every(currency => validDenomations.hasOwnProperty(`${currency}`))
}

function getChange(cashier, change) {
  if (change === 0) return { cashier, change: []}

  const notes = getCurrentCash(cashier)
  const noteCounter = []

  notes.forEach(note => {
    if (change >= note) {
      noteCounter.push(note)
      change = change - note
      cashier[`${note}`] = --cashier[`${note}`]
    }
  })

  if (change > 0) throw Error('NOT ENOUGH CHANGE')

  return { cashier, change: noteCounter}
}