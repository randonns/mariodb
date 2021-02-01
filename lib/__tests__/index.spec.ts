import createMario, { Mario, ExecutionContext } from "mariodb"
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

describe("Mario 인스턴스", () => {
  test("createMario가 함수여야 한다.", () => {
    expect(createMario).toBeInstanceOf(Function)
  })

  test("타입이 맞아야 한다.", () => {
    expect(mario).toBeInstanceOf(Mario)
  })

  test("필드와 메소드들을 가지고 있어야 한다.", () => {
    expect(mario.end).toBeInstanceOf(Function)
  })
})
