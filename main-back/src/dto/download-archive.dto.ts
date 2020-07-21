import { IsNotEmpty, IsString } from 'class-validator';

export class DownloadArchiveDto {
  @IsString()
  @IsNotEmpty()
  link: string;
}
