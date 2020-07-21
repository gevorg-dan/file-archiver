import { Injectable } from '@nestjs/common';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  createArchive(processId: string): void {
    const zip = new JSZip();
    const tempFilesDir = `../main-back/temp-files/${processId}`;
    const downloadDir = "../main-back/download";
    const files = fs.readdirSync(tempFilesDir);

    files.forEach(file => {
      const filePath = path.resolve(tempFilesDir, file)
      const content = fs.readFileSync(filePath);
      zip.file(file, content, { binary: true });
      fs.unlinkSync(filePath)
    });

    fs.rmdirSync(tempFilesDir);

    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(`${downloadDir}/${processId}.zip`))
      .on('finish', () => {
        console.log('file written');
      });
  }
}
