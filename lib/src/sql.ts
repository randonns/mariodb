import ExecutionContext from "./context"

export default class SQL {
  statement: string
  params: any[]

  constructor(private context: ExecutionContext | null, private strings: string[], private keys: any[]) {
    this.statement = strings.join("?").trim()
    this.params = keys
  }

  append(sql: SQL): void {
    this.statement = this.statement + " " + sql.statement
    this.params = this.params.concat(sql.params)
  }

  prepend(sql: SQL): void {
    this.statement = sql.statement + " " + this.statement
    this.params = sql.params.concat(this.params)
  }

  async run(context: ExecutionContext | null) {
    const ctx = context || this.context
    if (ctx) return await ctx.run(this)
    else throw new Error("Execution context not found.")
  }
}
