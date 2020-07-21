import {
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
  CreateDateColumn,
} from 'typeorm';
import { ArchiveStatus } from '../enum/archiveStatus.enum';

@Entity()
export class Archive {
  @ObjectIdColumn()
  id: ObjectID;

  @Column({ nullable: false })
  archivingProcessId: string;

  @Column({
    enum: [ArchiveStatus.FAILED, ArchiveStatus.PENDING, ArchiveStatus.READY],
    nullable: false,
  })
  status: ArchiveStatus;

  @Column({ nullable: true, default: null })
  link: string;

  @Column({ nullable: true, default: null })
  archive: string;

  @Column()
  createdDate: number;
}
