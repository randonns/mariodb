import SQL from "./sql"

export default interface ExecutionContext {
  sql(strings: string[], ...keys: any[]): SQL
  execute(sql: SQL): Promise<any>
}
