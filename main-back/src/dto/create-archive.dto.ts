import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateArchiveDto {
  @IsNotEmpty()
  @MaxLength(10, { each: true })
  files: any[];
}
