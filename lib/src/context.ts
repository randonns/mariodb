import SQL from "./sql"

export default interface ExecutionContext {
  sql(strings: string[], ...keys: any[]): SQL
  run(sql: SQL): Promise<any>
}
