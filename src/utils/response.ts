import { Response } from 'express';

// Definimos la forma que tendrá SIEMPRE nuestra respuesta
interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;          
    message?: string;  
    errors?: any;     
}


export const success = <T>(
    res: Response, 
    data: T, 
    statusCode: number = 200
) => {
    const responseBody: ApiResponse<T> = {
        status: 'success',
        data: data
    };
    
    return res.status(statusCode).json(responseBody);
};

export const error = (
    res: Response, 
    message: string, 
    statusCode: number = 500,
    details?: any
) => {
    const responseBody: ApiResponse<null> = {
        status: 'error',
        message: message,
        errors: details || null
    };

    return res.status(statusCode).json(responseBody);
};