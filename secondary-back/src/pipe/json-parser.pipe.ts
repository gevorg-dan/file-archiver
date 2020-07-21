import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class JsonParserPipe implements PipeTransform {
  transform(value: string): any {
    return JSON.parse(value).data;
  }
}
