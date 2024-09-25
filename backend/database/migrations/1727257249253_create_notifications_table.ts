import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().references('users.user_id').onDelete('CASCADE')
      table.integer('channel_id').unsigned().nullable().references('channels.channel_id').onDelete('SET NULL')
      table.enum('type', ['message', 'mention', 'invite', 'kick']).notNullable() // Enum for notification type
      table.string('message').notNullable()
      table.boolean('is_read').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
