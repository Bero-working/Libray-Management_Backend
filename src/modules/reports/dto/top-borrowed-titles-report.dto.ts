import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class TopBorrowedTitlesReportDto {
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from!: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
