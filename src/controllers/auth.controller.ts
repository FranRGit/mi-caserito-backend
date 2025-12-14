import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as response from '../utils/response';
import { RegisterUserDTO } from '../dtos/auth.dto';

export const register = async (req: Request, res: Response) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        const userData = req.body as RegisterUserDTO;

        const result = await authService.registerUser(userData, files);
        
        return response.success(res, result, 201);
    } catch (error: any) {
        return response.error(res, error.message, 400);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
        return response.error(res, 'Faltan credenciales (email, password)', 400);
        }

        const result = await authService.loginUser(email, password);
        return response.success(res, result, 200);
    } catch (error: any) {
        return response.error(res, error.message, 401);
    }
};