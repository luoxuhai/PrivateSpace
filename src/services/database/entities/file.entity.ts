import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  VersionColumn,
  BaseEntity,
} from 'typeorm/browser';

/**
 * 资源类型
 */
export const enum SourceType {
  Unknown = 0,
  Text,
  Image,
  Audio,
  Video,
  Application,
}

export const enum FileType {
  // 文件
  File = 1,
  // 文件夹
  Folder = 2,
}

export const enum FileStatus {
  // 正常
  Normal = 1,
  // 已删除
  Deleted = 2,
}

@Entity('file')
export default class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Index()
  @Column('varchar', { nullable: true })
  parent_id?: string;

  @Column('varchar')
  owner!: string;

  @Index()
  @Column('varchar')
  name!: string;

  @Column('int', {
    default: FileType.Folder,
    nullable: true,
  })
  type?: FileType;

  @Column('varchar', { nullable: true })
  mime?: string;

  @Column('int', {
    default: FileStatus.Normal,
    nullable: true,
  })
  status?: FileStatus;

  @Column('int', { default: 0 })
  size?: number;

  @Column('int')
  ctime!: number;

  @Column('int')
  mtime!: number;

  @Column('simple-json', { nullable: true, comment: '系统标签' })
  labels?: FileLabel;

  @Column('text', { nullable: true, comment: '描述' })
  description?: string;

  @Column('simple-json', { nullable: true, comment: '元数据' })
  metadata?: FileMetadata;

  @Column('simple-json', { nullable: true })
  extra?: FileExtra;

  @VersionColumn({ default: 0 })
  version?: number;
}
