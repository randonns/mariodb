# MarioDB

**The simplest MariaDB client for Node.js.**

## Installation

The library is available through the Node.js repositories. You can install it using npm:

```shell
$ npm install mariodb
```

## Basic Usage

```js
const mario = require("mariodb").createMario({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  connectionLimit: 5
})

const id = 30
const rows = await mario.sql`SELECT * FROM Users WHERE id = ${id}`.run()
// [ { id: 1, name: ..., age: ... }, { id: 2, name: ..., age: ... }, ... ]

const result = await mario.sql`INSERT INTO TableName VALUES (${5}, ${"Value"})`.run()
// { affectedRows: 1, insertId: 5, warningStatus: 0 }
```

Connection options are [here](https://github.com/mariadb-corporation/mariadb-connector-nodejs/blob/master/documentation/connection-options.md).

## Multiple Databases

```js
const { createMario } = require("mariodb")

const mario1 = createMario({
  host: process.env.DB1_HOST,
  user: process.env.DB1_USER
})

const mario2 = createMario({
  host: process.env.DB2_HOST,
  user: process.env.DB2_USER
})

const result1 = await mario1.sql`SELECT * FROM Users`.run()
const result2 = await mario2.sql`SELECT * FROM Users`.run()
```

## Transaction

```js
const t = await mario.transaction()

try {
  const result1 = await t.sql`INSERT INTO ...`.run()
  const result2 = await t.sql`UPDATE ...`.run()
  const result3 = await t.sql`DELETE FROM ...`.run()

  await t.commit()
} catch (e) {
  await t.rollback()
}
```

## Reusing Query

You can create `sql` without context to make it reusable.

```js
// sqls.js
const { sql } = require("mariodb")

// Create a sql without context
exports.insertSql = sql`INSERT INTO ...`
```

Not only `Mario` but also `Transaction` instances work as contexts.

```js
const { insertSql } = require("./sqls")

// Run with Mario instance
const result1 = await insertSql.run(mario)

// Run with Transaction instance
const t = await mario.transaction()
const result2 = await insertSql.run(t)
await t.commit()
```

## Nesting

```js
const query1 = sql`SELECT foo FROM bar`
const query2 = sql`SELECT baz FROM (${query1})`
```

## Dynamic Query

```js
const query = sql`WHERE deleted = ${false}`

if (name) query.append(sql`AND name LIKE ${`%${name}%`}`)
if (dept) query.append(sql`AND dept LIKE ${`%${dept}%`}`)
if (limit > 0) query.append(sql`AND limit < ${limit}`)

query.prepend(sql`SELECT * FROM Users`)
query.append(sql`ORDER BY id DESC`)

const rows = await query.run(mario)
```

## Handy Methods

```js
// Returns array: [ { id: 1, name: ..., age: ... }, { id: 2, name: ..., age: ... }, ... ]
const result1 = await mario.sql`SELECT * FROM Users`.rows()

// Returns single object: { id: 3, name: ..., age: ... }
// Returns null if not exists
const result2 = await mario.sql`SELECT * FROM Users WHERE id = ${3}`.row()

// Returns single value: 37
const result3 = await mario.sql`SELECT COUNT(*) FROM Users`.value()
```
