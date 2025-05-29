import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  BaseModel,
  column,
  beforeSave,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import Education from "./Education";
import Skill from "./Skill";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column.date({ serializeAs: "birth_date" })
  public birthDate: DateTime;

  @column()
  public email: string;

  @column()
  public phone: string;

  @column()
  public cep: string;

  @column()
  public address: string;

  @column()
  public city: string;

  @column()
  public state: string;

  @column()
  public role: "candidate" | "manager";

  @column({ serializeAs: "selected_for_interview" })
  public selectedForInterview?: boolean;

  @column.date({
    serializeAs: "interview_date",
    serialize: (value: DateTime | null) => {
      return value ? value.toFormat("yyyy-MM-dd") : value;
    },
    prepare: (value: string | DateTime | null) => {
      if (typeof value === "string") {
        return DateTime.fromISO(value).toISODate();
      }
      return value ? value.toISODate() : value;
    },
  })
  public interviewDate?: DateTime;

  @column({ serializeAs: "interview_time" })
  public interviewTime?: string;

  @column({ serializeAs: null })
  public password?: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password!);
    }
  }

  @hasMany(() => Education, {
    foreignKey: "user_id",
    localKey: "id",
    serializeAs: "educations",
    onQuery: (query) => {
      query.select([
        "id",
        "user_id",
        "course_name",
        "institution",
        "concluded_at",
      ]);
    },
  })
  public educations: HasMany<typeof Education>;

  @manyToMany(() => Skill, {
    pivotTable: "user_skills",
    pivotForeignKey: "user_id",
    pivotRelatedForeignKey: "skill_id",
    localKey: "id",
    relatedKey: "id",
    serializeAs: "skills",
    onQuery: (query) => {
      query.select(["id", "name"]);
    },
  })
  public skills: ManyToMany<typeof Skill>;
}
