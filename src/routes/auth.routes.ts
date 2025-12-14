import { Router } from 'express';
import multer from 'multer';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Configuración temporal de Multer (Memoria)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const registerUploads = upload.fields([
    { name: 'dni_url', maxCount: 1 },
    { name: 'profile_url', maxCount: 1 }
]);

router.post('/register', registerUploads, authController.register);
router.post('/login', authController.login);

export default router;