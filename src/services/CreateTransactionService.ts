import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string
  type: 'income' | 'outcome'
  value: number
  category: string
}

class CreateTransactionService {
  public async execute({ title, type, value, category }: RequestDTO): Promise<Transaction> {

    const categoriesRepository = getRepository(Category)
    let _category = await categoriesRepository.findOne({ where: { title: category }})

    if (!_category) {
      _category = await categoriesRepository.save({ title: category })
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository)

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError('Insuficient funds.');
    }

    const transaction = transactionsRepository.create({ title, type, value, category_id: _category?.id })

    await transactionsRepository.save(transaction)
    return transaction
  }
}

export default CreateTransactionService;
