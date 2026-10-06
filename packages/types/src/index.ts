export type Uuid = string;

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL';

export type ApiMeta = {
  request_id: string;
  timestamp: string;
  version: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null;
  sdi_metadata?: {
    dataOwner: string;
    dataClassification: DataClassification;
  } | null;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta: ApiMeta;
};

export type ApiErrorItem = {
  code: string;
  field?: string;
  message: string;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: ApiErrorItem[];
  meta: Pick<ApiMeta, 'request_id' | 'timestamp'>;
};

export type Actor = {
  id: Uuid;
  email?: string;
  name?: string;
  permissions: string[];
};

export const SERVICE_PRINCIPAL_ID = '00000000-0000-0000-0000-000000000001';
