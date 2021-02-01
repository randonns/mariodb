import createMario, { SQL, sql } from "mariodb"
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

describe("SQL", () => {
  test("타입이 맞아야 한다.", () => {
    const s = sql`SELECT * FROM Users`
    expect(s).toBeInstanceOf(SQL)
  })

  test("컨텍스트가 없는 경우", async () => {
    const s = sql`SELECT * FROM Users`
    await expect(s.run()).rejects.toThrow(new Error("Execution context not found."))
  })

  test("SELECT : 실행시 컨텍스트 지정", async () => {
    const s = sql`SELECT * FROM Users`
    const result = await s.run(mario)
    expect(result).toHaveLength(4)
  })

  test("SELECT : 전체", async () => {
    const s = mario.sql`SELECT * FROM Users`
    expect(s).toBeInstanceOf(SQL)
    expect(s.statement).toBe("SELECT * FROM Users")
    expect(s.params).toEqual([])

    const result = await s.run()
    expect(result).toHaveLength(4)
  })

  test("SELECT : 하나", async () => {
    const s = mario.sql`SELECT * FROM Users WHERE id = ${3}`
    expect(s.statement).toBe("SELECT * FROM Users WHERE id = ?")
    expect(s.params).toEqual([3])

    const result = await s.run()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
    expect(result[0].name).toBe("홍상직")
    expect(result[0].deleted).toBe(0)
  })

  test("SELECT : Boolean", async () => {
    const s = mario.sql`SELECT * FROM Users WHERE deleted = ${false}`
    expect(s.statement).toBe("SELECT * FROM Users WHERE deleted = ?")
    expect(s.params).toEqual([false])

    const result = await s.run()
    expect(result).toHaveLength(3)
  })

  test("SELECT : 이름 검색", async () => {
    const s = mario.sql`SELECT * FROM Users WHERE name LIKE ${`%홍%`}`
    expect(s.statement).toBe("SELECT * FROM Users WHERE name LIKE ?")
    expect(s.params).toEqual(["%홍%"])

    const result = await s.run()
    expect(result).toHaveLength(4)
  })

  test("SELECT : 여러 파라미터", async () => {
    const s = mario.sql`SELECT * FROM Users WHERE name LIKE ${`%홍%`} AND deleted = ${false}`
    expect(s.statement).toBe("SELECT * FROM Users WHERE name LIKE ? AND deleted = ?")
    expect(s.params).toEqual(["%홍%", false])

    const result = await s.run()
    expect(result).toHaveLength(3)
  })

  test("SELECT : 동적 쿼리 append", async () => {
    const s = mario.sql`SELECT * FROM Users WHERE name LIKE ${`%홍%`}`
    s.append(sql`AND age = ${28}`)
    s.append(sql`AND deleted = ${false}`)
    expect(s.statement).toBe("SELECT * FROM Users WHERE name LIKE ? AND age = ? AND deleted = ?")
    expect(s.params).toEqual(["%홍%", 28, false])

    const result = await s.run()
    expect(result).toHaveLength(1)
  })

  test("SELECT : 동적 쿼리 prepend", async () => {
    const s = mario.sql`AND age = ${28}`
    s.append(sql`AND deleted = ${false}`)
    s.prepend(sql`SELECT * FROM Users WHERE name LIKE ${`%홍%`}`)
    expect(s.statement).toBe("SELECT * FROM Users WHERE name LIKE ? AND age = ? AND deleted = ?")
    expect(s.params).toEqual(["%홍%", 28, false])

    const result = await s.run()
    expect(result).toHaveLength(1)
  })

  test("SELECT : 좌우 공백 제거", async () => {
    const s = mario.sql`   AND age = ${28}   `
    s.append(sql`    AND deleted = ${false}   `)
    s.prepend(sql`   SELECT * FROM Users  WHERE name LIKE ${`%홍%`}    `)
    expect(s.statement).toBe("SELECT * FROM Users  WHERE name LIKE ? AND age = ? AND deleted = ?")
    expect(s.params).toEqual(["%홍%", 28, false])

    const result = await s.run()
    expect(result).toHaveLength(1)
  })

  test("INSERT", async () => {
    const s = mario.sql`INSERT INTO Users (id, name, age, deleted, createdAt)
      VALUES (${5}, ${"테스트"}, ${30}, ${false}, NOW())`
    expect(s.statement).toBe("INSERT INTO Users (id, name, age, deleted, createdAt)\n      VALUES (?, ?, ?, ?, NOW())")
    expect(s.params).toEqual([5, "테스트", 30, false])

    const result = await s.run()
    expect(result).toBeInstanceOf(Object)
    expect(result.affectedRows).toBe(1)
    expect(result.insertId).toBe(5)
    expect(result.warningStatus).toBe(0)
  })

  test("UPDATE", async () => {
    const s = mario.sql`UPDATE Users SET age = ${20} WHERE id = ${5}`
    expect(s.statement).toBe("UPDATE Users SET age = ? WHERE id = ?")
    expect(s.params).toEqual([20, 5])

    const result = await s.run()
    expect(result).toBeInstanceOf(Object)
    expect(result.affectedRows).toBe(1)
    expect(result.insertId).toBe(0)
    expect(result.warningStatus).toBe(0)
  })

  test("UPDATE : 결과 확인", async () => {
    const s = mario.sql`SELECT age FROM Users WHERE id = ${5}`
    expect(s.statement).toBe("SELECT age FROM Users WHERE id = ?")
    expect(s.params).toEqual([5])

    const result = await s.run()
    expect(result).toHaveLength(1)
    expect(result[0].age).toBe(20)
  })

  test("DELETE", async () => {
    const s = mario.sql`DELETE FROM Users WHERE id = ${5}`
    expect(s.statement).toBe("DELETE FROM Users WHERE id = ?")
    expect(s.params).toEqual([5])

    const result = await s.run()
    expect(result).toBeInstanceOf(Object)
    expect(result.affectedRows).toBe(1)
    expect(result.insertId).toBe(0)
    expect(result.warningStatus).toBe(0)
  })

  test("DELETE : Syntax Error", async () => {
    const s = mario.sql`DELETE FROM Users WHE RE id = ${5}`
    expect(s.statement).toBe("DELETE FROM Users WHE RE id = ?")
    expect(s.params).toEqual([5])

    await expect(s.run()).rejects.toThrow(/You have an error in your SQL syntax;/)
  })

  test("SELECT : Nesting", async () => {
    const s1 = mario.sql`AND deleted = ${false} `
    const s2 = mario.sql` SELECT * FROM Users WHERE name LIKE ${`%홍%`} ${s1}  AND age < ${30}  `
    expect(s2.statement).toBe("SELECT * FROM Users WHERE name LIKE ? AND deleted = ?  AND age < ?")
    expect(s2.params).toEqual(["%홍%", false, 30])

    const result = await s2.run()
    expect(result).toHaveLength(2)
  })
})
