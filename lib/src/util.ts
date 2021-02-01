import { fromPairs, toPairs } from "lodash"
import { camelCase } from "change-case"
import SQL from "./sql"

export function beautifyQueryResult(result: any): any {
  // DML이 아닐 경우, convertCase 해서 반환한다.
  return result.affectedRows != null ? result : result.map(convertCase)
}

/**
 * 객체의 property들의 이름을 camelCase로 바꾼다.
 *
 * @param obj 객체
 */
function convertCase(obj: any): any {
  const pairs = toPairs(obj)
  const converted = pairs.map(([key, value]) => [camelCase(key), value])
  return fromPairs(converted)
}

export function sql(strings: string[], ...keys: any[]) {
  return new SQL(null, strings, keys)
}
