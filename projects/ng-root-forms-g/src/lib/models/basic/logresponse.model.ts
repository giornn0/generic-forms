export interface LogResponse {
  id:number,
  token: string;
  message: string;
  error?: {
    message: string;
  };
}
