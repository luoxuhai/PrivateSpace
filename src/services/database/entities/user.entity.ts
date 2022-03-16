import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm/browser';

export const enum EUserType {
  /* 管理员 */
  ADMIN = 1,
  /* 访客 */
  GHOST = 2,
}

@Entity('user')
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int')
  type!: EUserType;

  @Column('varchar', { nullable: true })
  email?: string;

  @Column('varchar', { nullable: true })
  password?: string;

  @Column('simple-json', { nullable: true })
  extra?: UserExtra;
}
