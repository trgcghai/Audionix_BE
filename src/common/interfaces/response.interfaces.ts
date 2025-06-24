interface BaseResponse {
  status: string;
  statusCode: number;
  metadata: Record<string, any>;
}

export interface ErrorResponse extends BaseResponse {
  message: string;
  error: string;
}

export interface Response<T> extends BaseResponse {
  data: T;
}
