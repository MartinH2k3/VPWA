import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Message from '#models/message'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare admin_id: number

  @column()
  declare is_private: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @belongsTo(() => User, { foreignKey: 'admin_id' })
  declare admin: BelongsTo<typeof User>

  @hasMany(() => Message, { foreignKey: 'channel_id' })
  declare messages: HasMany<typeof Message>

  @manyToMany(() => User, {
    pivotTable: 'channel_users',
    localKey: 'id',
    pivotForeignKey: 'channel_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
    pivotColumns: ['kick_votes', 'kicked'],
  })
  declare members: ManyToMany<typeof User>
}
