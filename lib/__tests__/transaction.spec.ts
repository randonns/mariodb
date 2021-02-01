import createMario, { Transaction, sql } from "mariodb"
import dotenv from "dotenv"
import path from "path"

// .env 파일이 package.json 파일보다 한 단계 위 폴더에 존재한다.
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") })

let mario = null

beforeAll(() => {
  mario = createMario({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    connectionLimit: 5
  })
})

afterAll(() => {
  mario.end()
})

describe("Transaction", () => {
  test("타입이 맞아야 한다.", async () => {
    const t = await mario.transaction()
    expect(t).toBeInstanceOf(Transaction)
    await t.rollback()
  })

  test("COMMIT", async () => {
    const t = await mario.transaction()
    await t.sql`INSERT INTO Users (id, name, age, deleted, createdAt) VALUES (${5}, ${`테스트`}, ${30}, ${false}, NOW())`.run()
    await t.sql`UPDATE Users SET age = ${47} WHERE id = ${3}`.run()
    await t.commit()

    const result = await mario.sql`SELECT * FROM Users WHERE id IN (${3}, ${5}) ORDER BY id`.run()
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(3)
    expect(result[0].age).toBe(47)
    expect(result[1].id).toBe(5)
    expect(result[1].age).toBe(30)
  })

  test("ROLLBACK", async () => {
    const t = await mario.transaction()
    await t.sql`INSERT INTO Users (id, name, age, deleted, createdAt) VALUES (${6}, ${`테스트`}, ${35}, ${false}, NOW())`.run()
    await t.sql`UPDATE Users SET age = ${46} WHERE id = ${3}`.run()

    // rollback 전에 확인
    const r1 = await t.sql`SELECT * FROM Users WHERE id IN (${3}, ${6}) ORDER BY id`.run()
    expect(r1).toHaveLength(2)
    expect(r1[0].id).toBe(3)
    expect(r1[0].age).toBe(46)
    expect(r1[1].id).toBe(6)
    expect(r1[1].age).toBe(35)

    await t.rollback()

    // rollback 후에 확인
    const r2 = await mario.sql`SELECT * FROM Users WHERE id IN (${3}, ${6}) ORDER BY id`.run()
    expect(r2).toHaveLength(1)
    expect(r2[0].id).toBe(3)
    expect(r2[0].age).toBe(47)
  })

  test("COMMIT : 커밋전 다른 연결에서 확인", async () => {
    const t = await mario.transaction()
    await t.sql`DELETE FROM Users WHERE id = ${5}`.run()
    await t.sql`UPDATE Users SET age = ${46} WHERE id = ${3}`.run()

    // 다른 연결에서 확인
    const r1 = await mario.sql`SELECT * FROM Users WHERE id IN (${3}, ${5}) ORDER BY id`.run()
    expect(r1).toHaveLength(2)
    expect(r1[0].id).toBe(3)
    expect(r1[0].age).toBe(47)
    expect(r1[1].id).toBe(5)
    expect(r1[1].age).toBe(30)

    await t.commit()

    // commit 후에 확인
    const r2 = await mario.sql`SELECT * FROM Users WHERE id IN (${3}, ${5}) ORDER BY id`.run()
    expect(r2).toHaveLength(1)
    expect(r2[0].id).toBe(3)
    expect(r2[0].age).toBe(46)
  })
})
