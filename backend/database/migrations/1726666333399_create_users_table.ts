// Table users {
//   user_id      int        [pk, increment] // Primary Key with auto-increment
//   fistname     varchar    [not null]
//   username     varchar    [unique, not null]
//   email        varchar    [unique, not null]
//   created_at   datetime   [not null]
//   last_login   datetime
// }


import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Primary Key

      table.string('fistname').notNullable()
      table.string('lastname').notNullable()
      table.string('username').notNullable().unique()
      table.string('email').notNullable().unique()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
