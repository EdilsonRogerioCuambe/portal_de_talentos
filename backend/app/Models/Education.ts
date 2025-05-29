import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Education extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'user_id' })
  public user_id: number

  @column({ columnName: 'course_name' })
  public courseName: string

  @column()
  public institution: string

  @column.date({ columnName: 'concluded_at', serializeAs: 'concluded_at' })
  public concludedAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'user_id',
    localKey: 'id',
    serializeAs: 'user',
    onQuery: (query) => {
      query.select(['id', 'name', 'email'])
    }
  })
  public user: BelongsTo<typeof User>
}