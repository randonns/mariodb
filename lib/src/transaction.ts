import { Connection } from "mariadb"
import ExecutionContext from "./context"
import SQL from "./sql"
import { beautifyQueryResult } from "./util"

export default class Transaction implements ExecutionContext {
  constructor(private con: Connection) {
    con.beginTransaction()
  }

  sql(strings: string[], ...keys: any[]): SQL {
    return new SQL(this, strings, keys)
  }

  async execute(sql: SQL): Promise<any> {
    const result = await this.con.query(sql.statement, sql.params)
    return beautifyQueryResult(result)
  }

  async commit() {
    await this.con.commit()
    await this.end()
  }

  async rollback() {
    await this.con.rollback()
    await this.end()
  }

  private async end() {
    await this.con.end()
  }
}
