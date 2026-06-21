import * as express from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        user?: any;
    }
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
