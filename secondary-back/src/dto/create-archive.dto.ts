import { IsString, IsNotEmpty } from 'class-validator';

export class CreateArchiveDto {
  @IsString()
  @IsNotEmpty()
  archivingProcessId: string;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsNotEmpty()
  readableStream: any;
}
