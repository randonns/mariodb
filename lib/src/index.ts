import { PoolConfig } from "mariadb"
import Mario from "./mario"
import SQL from "./sql"
import Transaction from "./transaction"

export default function createMario(options: PoolConfig) {
  return new Mario(options)
}

export { Mario }
export { SQL }
export { Transaction }
export { sql } from "./util"
