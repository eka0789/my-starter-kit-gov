import type { DataClassification } from '@kit/types';

export interface SDIMetadata {
  dataOwner: string;
  dataClassification: DataClassification;
  dataLineage?: string;
  lastUpdated: string;
}

export function createSDIMetadata(
  dataOwner: string,
  classification: DataClassification,
): SDIMetadata {
  return {
    dataOwner,
    dataClassification: classification,
    lastUpdated: new Date().toISOString(),
  };
}

export const GOVERNMENT_CODES = {
  BPS_WILAYAH: 'https://sig.bps.go.id/',
  KEMENDAGRI_WILAYAH: 'https://kodewilayah.kemendagri.go.id/',
};