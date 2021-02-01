import { PoolConfig } from "mariadb"
import Mario from "./mario"
import SQL from "./sql"

export default function createMario(options: PoolConfig) {
  return new Mario(options)
}

export { Mario }
export { SQL }
export { sql } from "./util"
