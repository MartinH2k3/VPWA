import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.increments('message_id') // Primary Key
      table.integer('channel_id').unsigned().references('channels.channel_id').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('users.user_id').onDelete('CASCADE')
      table.text('content').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
