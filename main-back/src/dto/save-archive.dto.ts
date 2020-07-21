import { IsNotEmpty, IsString } from 'class-validator';

export class SaveArchiveDto {
  @IsString()
  @IsNotEmpty()
  processId: string;
}
