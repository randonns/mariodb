import ExecutionContext from "./context"

export default class SQL {
  statement: string
  params: any[]

  constructor(private context: ExecutionContext | null, private strings: string[], private keys: any[]) {
    if (strings.length !== keys.length + 1) throw new Error("Invalid template literal.")

    this.statement = ""
    this.params = []

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] instanceof SQL) {
        this.statement += strings[i]
        this.statement += keys[i].statement
        this.params = this.params.concat(keys[i].params)
      } else {
        this.statement += strings[i] + "?"
        this.params.push(keys[i])
      }
    }

    this.statement += strings[keys.length]
    this.statement = this.statement.trim()
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
