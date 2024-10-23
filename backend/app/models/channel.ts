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
  declare adminId: number

  @column()
  declare isPrivate: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'adminId' })
  declare admin: BelongsTo<typeof User>

  @hasMany(() => Message)
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
