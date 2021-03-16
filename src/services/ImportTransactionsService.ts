import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import csvParse from 'csv-parse'
import fs from 'fs'
// import path from 'path'
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  title: string
  type: 'income' | 'outcome'
  value: number
  category: string
}

class ImportTransactionsService {

  private async loadCSV(csvFilePath: string): Promise<RequestDTO[]> {
    const readCSVStream = fs.createReadStream(csvFilePath)
    const parseStream = csvParse({
      from_line: 2, ltrim: true, rtrim: true
    })
    const parseCSV = readCSVStream.pipe(parseStream)
    const lines: RequestDTO[] = []

    parseCSV.on('data', async line => {
      const data: RequestDTO = {
        title: line[0],
        type: line[1] === 'income' ? line[1] : 'outcome',
        value: Number(line[2]),
        category: line[3],
      }
      lines.push(data)
    })

    await new Promise(async resolve => {
      parseCSV.on('end', resolve)
      await fs.promises.unlink(csvFilePath)
    })

    return lines
  }

  private createTransaction = new CreateTransactionService()

  async execute(csvFilePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository)

    // const csvFilePath = path.resolve(__dirname, )
    const transactionsData = await this.loadCSV(csvFilePath)
    for (const data of transactionsData) {
      await this.createTransaction.execute(data)
    }

    const transactions = await transactionsRepository.find()

    return transactions
  }
}

export default ImportTransactionsService;
