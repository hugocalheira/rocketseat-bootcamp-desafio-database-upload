import { EntityRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find()

    let income = 0
    let outcome = 0
    transactions.map(transaction => {
      if (transaction.type === 'income') {
        income += transaction.value
      } else {
        outcome += transaction.value
      }
    })

    const balance: Balance = {
      income,
      outcome,
      total: income - outcome
    }

    return balance
  }
}

export default TransactionsRepository;
