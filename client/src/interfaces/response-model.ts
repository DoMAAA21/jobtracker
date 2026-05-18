export default interface ResponseModel<T> {
    data: T;
    message: string | null;
    success: boolean;
  }