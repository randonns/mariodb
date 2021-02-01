import mariadb, { PoolConfig, Pool, Connection } from "mariadb"
import ExecutionContext from "./context"
import SQL from "./sql"
import Transaction from "./transaction"
import { beautifyQueryResult } from "./util"

export default class Mario implements ExecutionContext {
  private pool: Pool

  constructor(options: PoolConfig) {
    this.pool = mariadb.createPool(options)
  }

  sql(strings: string[], ...keys: any[]) {
    return new SQL(this, strings, keys)
  }

  async execute(sql: SQL): Promise<any> {
    let con: Connection
    try {
      con = await this.pool.getConnection()
      const result = await con.query(sql.statement, sql.params)
      return beautifyQueryResult(result)
    } finally {
      await con?.end()
    }
  }

  async transaction(): Promise<Transaction> {
    return new Transaction(await this.pool.getConnection())
  }

  async end() {
    await this.pool.end()
  }
}
