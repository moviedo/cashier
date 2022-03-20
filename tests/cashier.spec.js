import { newCashier, getCurrentCash, pay } from '../cashier.js';

describe('cashier', () => {
  it('contains the correct cash after an exact payment', () => {
    let cashier = newCashier('$');
    let success, change;

    ({ success, change, cashier } = pay(cashier, 25, [10, 10, 5]));
    expect(change).toEqual([]);
    expect(success).toBeTruthy();
    expect(getCurrentCash(cashier)).toEqual([10, 10, 5]);
  });

  it("returns an error when there it isn't possible to give change back", () => {
    const cashier = newCashier('$');

    const { error, success } = pay(cashier, 10, [5, 2, 2, 2]);
    expect(success).toBeFalsy();
    expect(error).toBe('NOT ENOUGH CHANGE');
  });

  it('returns an error when paid amount is lower than purchase price', () => {
    const cashier = newCashier('$');

    const { error, success } = pay(cashier, 10, [5, 2, 2]);
    expect(success).toBeFalsy();
    expect(error).toBe('PAID LESS THAN PRICE');
  });

  it('returns an error when invalid bills or coins are paid', () => {
    const cashier = newCashier('$');
    let error, success;

    ({ error, success } = pay(cashier, 11, [11]));
    expect(success).toBeFalsy();
    expect(error).toBe('INVALID DENOMINATION');

    ({ error, success } = pay(cashier, 1, [0.5, 0.3, 0.2]));
    expect(success).toBeFalsy();
    expect(error).toBe('INVALID DENOMINATION');
  });

  it('gives change as long as it has the necessary coins and bills', () => {
    let cashier = newCashier('$');
    let success, change, error;

    ({ cashier, success, change } = pay(cashier, 11, [5, 2, 2, 1, 1]));
    expect(success).toBeTruthy();
    expect(change).toHaveLength(0);

    ({ cashier, success, change } = pay(cashier, 4, [5]));
    expect(success).toBeTruthy();
    expect(change).toEqual([1]);

    ({ cashier, success, change } = pay(cashier, 4, [5]));
    expect(success).toBeTruthy();
    expect(change).toEqual([1]);

    ({ cashier, success, error } = pay(cashier, 4, [5]));
    expect(success).toBeFalsy();
    expect(error).toBe('NOT ENOUGH CHANGE');

    expect(getCurrentCash(cashier)).toEqual([5, 5, 5, 2, 2]);
  });

  it('can trade up bills within multiple transactions', () => {
    let cashier = newCashier('$');
    let success, change, error;

    ({ cashier, success, change } = pay(cashier, 11, [5, 2, 2, 1, 1]));
    expect(success).toBeTruthy();
    expect(change).toHaveLength(0);

    ({ cashier, success, change } = pay(cashier, 6, [10]));
    expect(success).toBeTruthy();
    expect(change).toEqual([2, 2]);

    ({ cashier, success, change } = pay(cashier, 8, [20]));
    expect(success).toBeTruthy();
    expect(change).toEqual([10, 1, 1]);

    ({ cashier, success, error } = pay(cashier, 1, [2]));
    expect(success).toBeFalsy();
    expect(error).toBe('NOT ENOUGH CHANGE');

    ({ cashier, success, error } = pay(cashier, 3, [5]));
    expect(success).toBeFalsy();
    expect(error).toBe('NOT ENOUGH CHANGE');

    ({ cashier, success, change } = pay(cashier, 25, [50]));
    expect(success).toBeTruthy();
    expect(change).toEqual([20, 5]);

    expect(getCurrentCash(cashier)).toEqual([50]);
  });

  it('gives superfluous coins/bills back, even when the cashier is empty', () => {
    let cashier = newCashier('$');
    let success, change;

    ({ cashier, success, change } = pay(cashier, 6, [5, 1, 1]));
    expect(success).toBeTruthy();
    expect(change).toEqual([1]);

    expect(getCurrentCash(cashier)).toEqual([5, 1]);
  });

  it('can deal with small coins', () => {
    let cashier = newCashier('$');
    let success, change;

    ({ cashier, success, change } = pay(cashier, 0.55, [0.25, 0.1, 0.1, 0.1]));
    expect(success).toBeTruthy();
    expect(change).toHaveLength(0);

    ({ cashier, success, change } = pay(cashier, 0.7, [1]));
    expect(success).toBeTruthy();
    expect(change).toEqual([0.1, 0.1, 0.1]);

    expect(getCurrentCash(cashier)).toEqual([1, 0.25]);
  });

  it("handles scenario where some of the largest bills/coins can't be used to provide change", () => {
    let cashier = newCashier('$');
    let success, change, error;

    ({ cashier, success, change } = pay(cashier, 11.25, [5, 2, 2, 1, 1, 0.25]));
    expect(success).toBeTruthy();
    expect(change).toHaveLength(0);

    ({ cashier, success, change } = pay(cashier, 3.75, [10]));
    expect(success).toBeTruthy();
    expect(change).toEqual([5, 1, 0.25]);
  });
});
