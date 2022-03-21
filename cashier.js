import _ from 'lodash'
import currencyjs from 'currency.js'

/**
 * creates a new cashier
 * takes in a currency, e.g. $
 */
export function newCashier(currency) {
  const denominations = {
    bills: {
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
      '2': 0,
      '1': 0,
    },
    cents: {
      '0.5': 0,
      '0.25': 0,
      '0.1': 0,
      '0.05': 0,
      '0.01': 0,
    }
  }

  if (_.isArray(currency)) {
    currency.forEach(item => {
      if (currencyjs(item).dollars()) {
        denominations.bills[`${item}`] += 1
      } else {
        denominations.cents[`${item}`] += 1
      }
    }) 
  }

  return denominations
}

/**
 * Receives the cashier and returns a list with all the bills and coins currently in the cashier, in descending order.
 *    Output example: [100, 50, 50, 5, 2, 1, 1, 0.05, 0.01, 0.01]
 */
export function getCurrentCash(cashier) {
  return getCashHelper(cashier.bills).concat(getCashHelper(cashier.cents))
}

function getCashHelper(currencies) {
  const list = _.reduce(currencies, (acc, value, key) => {
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
  return purchaseBills.reduce((currency, acc) => currencyjs(acc).add(currency), 0).value
}

function hasValidDenominations(purchaseBills=[]) {
  const validDenomations = newCashier('$')

  return purchaseBills.every(currency => validDenomations.bills.hasOwnProperty(`${currency}`) || validDenomations.cents.hasOwnProperty(`${currency}`))
}

function getChange(cashier, change) {
  const origChange = change
  const origCashier = _.cloneDeep(cashier)
  if (change === 0) return { cashier, change: []}

  let notes = getCurrentCash(cashier)
  let noteCounter = []

  notes.forEach(note => {    
    if (change >= note) {
      noteCounter.push(note)
      change = currencyjs(change).subtract(note).value
      currencyjs(note).dollars() ? cashier.bills[`${note}`] -= 1 : cashier.cents[`${note}`] -= 1
    }
  })

  if (change > 0) {
    noteCounter = []
    change = origChange
    cashier = origCashier

    if (currencyjs(change).dollars()) {
      getCashHelper(cashier.bills).forEach(note => { 
        const dollars = currencyjs(change).dollars()

        if (dollars % note === 0) {
          noteCounter.push(note)
          change = currencyjs(change).subtract(note).value
          cashier.bills[`${note}`] -= 1
        }
      })
    }

    if (currencyjs(change).cents()) {
      getCashHelper(cashier.cents).forEach(note => {  
        const cents = currencyjs(change).cents()
        if (cents % currencyjs(note).cents() === 0) {
          noteCounter.push(note)
          change = currencyjs(change).subtract(note).value
          cashier.cents[`${note}`] -= 1
        }
      })
    }
  }

  if (change > 0) throw Error('NOT ENOUGH CHANGE')

  return { cashier, change: noteCounter}
}
