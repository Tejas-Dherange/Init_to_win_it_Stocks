import { AppError } from './AppError';

export class ValidationError extends AppError {
    constructor(message: string, public errors?: any[]) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

export default ValidationError;
