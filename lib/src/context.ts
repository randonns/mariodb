import SQL from "./sql"

export default interface ExecutionContext {
  run(sql: SQL): Promise<any>
}
