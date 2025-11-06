// presign.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PRESIGN_METADATA_KEY = 'presign';
export const presign = () => SetMetadata(PRESIGN_METADATA_KEY, true);
