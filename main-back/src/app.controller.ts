import {
  Controller,
  Get,
  Header,
  Inject,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

import { AppService } from './app.service';

import { SaveArchiveDto } from './dto/save-archive.dto';

import { ArchiveStatus } from './enum/archiveStatus.enum';
import {safeMkDir} from "./lib/safeMkDir";

@Controller('archive')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('RABBIT_SERVICE') private rabbitClient: ClientProxy,
  ) {}

  @Post('create-task')
  async createNoteInBd(): Promise<{
    link: string;
    status: ArchiveStatus;
    archiveId: string;
  }> {
    const { link, status, archiveId } = await this.appService.createNoteInBd();
    return { link, status, archiveId };
  }

  @Post('create')
  async createTempFiles(@Req() req: Request): Promise<null> {
    const tempFilesDir = path.resolve(process.cwd(), "temp-files");
    const thisArchiveTempFilesDir = path.resolve(tempFilesDir, req.headers["process-id"] as string)
    safeMkDir(tempFilesDir);
    safeMkDir(thisArchiveTempFilesDir);

    req.pipe(
      fs.createWriteStream(
        path.resolve(thisArchiveTempFilesDir, req.headers['file-name'] as string),
      ),
    );

    return new Promise(resolve => {
      req.on('end', () => resolve(null));
    });
  }

  @Post('create-finish')
  async finishCreatingArchive(@Req() req: Request): Promise<null> {
    this.rabbitClient.emit("create_archive", {processId: req.headers["process-id"]})
    return null
  }

  @Get('get-status/:processId')
  async getArchiveStatus(
    @Param('processId') processId: string,
  ): Promise<{ status: ArchiveStatus }> {
    return processId ? await this.appService.getArchiveStatus(processId) : null;
  }

  @Get('download/:archiveName')
  @Header('Content-Type', 'application/zip')
  async downloadArchive(
    @Param('archiveName') archiveName: string,
    @Res() res: Response,
  ) {
    const fileName = `${archiveName}.zip`;
    const archivePath = path.resolve(process.cwd(), 'download', fileName);

    fs.createReadStream(archivePath).pipe(res);
  }

  @EventPattern('archive_ready')
  async setArchiveStatusReady(
    @Payload()
    { processId }: SaveArchiveDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    await this.appService.setArchiveStatusReady(processId);
    channel.ack(originalMsg);
  }
}
