import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterPaymentTransactions,
  summarizePaymentTransactions,
} from './paymentHistory.js';

const transactions = [
  { id: 'one', title: 'Aluguel novembro', date: '2026-11-02', amountInCents: 70000, status: 'paid', direction: 'incoming', counterparty: 'Ana', method: 'PIX' },
  { id: 'two', title: 'Aluguel novembro', date: '2026-11-10', amountInCents: 60000, status: 'pending', direction: 'incoming', counterparty: 'Bia', method: 'Boleto' },
  { id: 'three', title: 'Aluguel outubro', date: '2026-10-10', amountInCents: 50000, status: 'paid', direction: 'outgoing', counterparty: 'Lucas', method: 'PIX' },
  { id: 'four', title: 'Aluguel setembro', date: '2026-09-10', amountInCents: 40000, status: 'overdue', direction: 'outgoing', counterparty: 'Lucas', method: 'Boleto' },
  { id: 'five', title: 'Aluguel agosto', date: '2026-08-10', amountInCents: 30000, status: 'rejected', direction: 'outgoing', counterparty: 'Lucas', method: 'Cartão de crédito' },
];

describe('payment history filters and summary', () => {
  it('filters by inclusive period and payment status', () => {
    const result = filterPaymentTransactions(transactions, {
      startDate: '2026-09-10',
      endDate: '2026-09-10',
      status: 'overdue',
    });

    assert.deepEqual(result.map(({ id }) => id), ['four']);
  });

  it('combines text search with date and status filters', () => {
    const result = filterPaymentTransactions(transactions, {
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      status: 'pending',
      query: 'bia',
    });

    assert.deepEqual(result.map(({ id }) => id), ['two']);
  });

  it('filters rejected payments without counting them as paid or open', () => {
    const result = filterPaymentTransactions(transactions, { status: 'rejected' });

    assert.deepEqual(result.map(({ id }) => id), ['five']);
    assert.deepEqual(summarizePaymentTransactions(result), {
      received: 0,
      paid: 0,
      open: 0,
      platformFees: 0,
    });
  });

  it('summarizes received, paid, and open amounts in exact cents', () => {
    assert.deepEqual(summarizePaymentTransactions(transactions), {
      received: 70000,
      paid: 50000,
      open: 100000,
      platformFees: 0,
    });
  });

  it('shows net rent received and the platform fee separately', () => {
    const [transaction] = filterPaymentTransactions([
      {
        id: 'marketplace-payment',
        amountInCents: 105000,
        rentAmountInCents: 100000,
        platformFeeInCents: 5000,
        status: 'paid',
        direction: 'incoming',
      },
    ]);

    assert.deepEqual(summarizePaymentTransactions([transaction]), {
      received: 100000,
      paid: 0,
      open: 0,
      platformFees: 5000,
    });
  });
});
