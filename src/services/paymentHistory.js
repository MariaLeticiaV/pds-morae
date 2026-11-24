export function filterPaymentTransactions(
  transactions,
  { startDate = '', endDate = '', status = 'all', query = '' } = {},
) {
  const search = query.trim().toLocaleLowerCase('pt-BR');

  return transactions.filter((transaction) => {
    if (startDate && transaction.date < startDate) return false;
    if (endDate && transaction.date > endDate) return false;
    if (status !== 'all' && transaction.status !== status) return false;

    return !search || [
      transaction.title,
      transaction.counterparty,
      transaction.method,
    ].some((value) => value.toLocaleLowerCase('pt-BR').includes(search));
  });
}

export function summarizePaymentTransactions(transactions) {
  return transactions.reduce((summary, transaction) => {
    const netAmount = transaction.direction === 'incoming' &&
      Number.isSafeInteger(transaction.rentAmountInCents)
      ? transaction.rentAmountInCents
      : transaction.amountInCents;

    if (transaction.status === 'paid') {
      if (transaction.direction === 'incoming') {
        summary.received += netAmount;
      } else if (transaction.direction === 'outgoing') {
        summary.paid += transaction.amountInCents;
      }
      summary.platformFees += Number.isSafeInteger(transaction.platformFeeInCents)
        ? transaction.platformFeeInCents
        : 0;
    } else if (transaction.status === 'pending' || transaction.status === 'overdue') {
      summary.open += netAmount;
    }

    return summary;
  }, { received: 0, paid: 0, open: 0, platformFees: 0 });
}
