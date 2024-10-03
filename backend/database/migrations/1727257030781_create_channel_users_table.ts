import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channel_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Primary Key

      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('channel_id').unsigned().references('channels.id').onDelete('CASCADE')
      table.integer('kick_votes').defaultTo(0) // Number of votes for kick
      table.boolean('kicked').defaultTo(false) // Whether the user is kicked
      table.timestamp('joined_at', { useTz: true }).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
