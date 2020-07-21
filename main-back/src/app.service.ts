import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

import { Archive } from './entity/archive.entity';

import { ArchiveStatus } from './enum/archiveStatus.enum';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Archive)
    private archiveRepository: Repository<Archive>,
    @Inject('RABBIT_SERVICE') private rabbitClient: ClientProxy,
  ) {
    setInterval(async () => {
      const firstDocument = await this.archiveRepository.findOne({});

      if (!firstDocument) return;
      if (Date.now() - firstDocument.createdDate < 1000 * 60 * 10) return;

      await this.archiveRepository.clear();
      const dirPath = path.resolve(process.cwd(), 'download');

      if (!fs.existsSync(dirPath)) return;

      fs.readdir(dirPath, (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
        files.forEach(file => {
          fs.unlink(path.resolve(dirPath, file), err => console.error(err));
        });
      });
    }, 1000 * 60 * 10);
  }

  async createNoteInBd(): Promise<{
    status: ArchiveStatus;
    archiveId: string;
    link: string;
  }> {
    const archivingProcessId = uuid.v1();
    const link = `download/${archivingProcessId}`;
    const linkToDownload = `http://localhost:4040/archive/${link}`;

    await this.archiveRepository.insert({
      archivingProcessId,
      status: ArchiveStatus.PENDING,
      link: linkToDownload,
      createdDate: Date.now(),
    });

    return {
      status: ArchiveStatus.PENDING,
      archiveId: archivingProcessId,
      link: linkToDownload,
    };
  }

  async getArchiveStatus(
    archivingProcessId: string,
  ): Promise<{ status: ArchiveStatus }> {
    const { status } = await this.archiveRepository.findOneOrFail({
      archivingProcessId,
    });
    return { status };
  }

  async setArchiveStatusReady(archivingProcessId: string) {
    const document = await this.archiveRepository.findOneOrFail({
      archivingProcessId,
    });

    await this.archiveRepository.save({
      ...document,
      status: ArchiveStatus.READY,
    });
    return null;
  }
}
