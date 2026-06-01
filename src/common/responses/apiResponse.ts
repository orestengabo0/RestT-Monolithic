import { Response } from 'express';

interface ApiResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) {
    const response: ApiResponseData<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string = 'Error', statusCode: number = 500, errors?: any) {
    const response: ApiResponseData<null> = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message: string = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message: string = 'No content') {
    return res.status(204).send();
  }
}
