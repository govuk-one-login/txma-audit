import { SourceTypeEnum } from '../enums/source-type.enum';

export interface IEventSourceDetails {
    sourceName: string;
    sourceType: SourceTypeEnum;
}
