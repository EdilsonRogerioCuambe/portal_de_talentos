import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Skill extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'user_skills',
    pivotForeignKey: 'skill_id',
    pivotRelatedForeignKey: 'user_id',
    localKey: 'id',
    relatedKey: 'id',
  })
  public users: ManyToMany<typeof User>
}