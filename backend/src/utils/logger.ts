const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
    info: (message: string, meta?: any) => {
        const timestamp = new Date().toISOString();
        const log = {
            timestamp,
            level: 'INFO',
            message,
            ...meta
        };
        if (isDevelopment) {
            console.log(`[\x1b[34m${timestamp}\x1b[0m] \x1b[32mINFO\x1b[0m: ${message}`, meta ? meta : '');
        } else {
            console.log(JSON.stringify(log));
        }
    },
    error: (message: string, error?: any) => {
        const timestamp = new Date().toISOString();
        const log = {
            timestamp,
            level: 'ERROR',
            message,
            error: error?.message || error,
            stack: error?.stack
        };
        if (isDevelopment) {
            console.error(`[\x1b[34m${timestamp}\x1b[0m] \x1b[31mERROR\x1b[0m: ${message}`, error);
        } else {
            console.error(JSON.stringify(log));
        }
    },
    warn: (message: string, meta?: any) => {
        const timestamp = new Date().toISOString();
        const log = {
            timestamp,
            level: 'WARN',
            message,
            ...meta
        };
        if (isDevelopment) {
            console.warn(`[\x1b[34m${timestamp}\x1b[0m] \x1b[33mWARN\x1b[0m: ${message}`, meta ? meta : '');
        } else {
            console.warn(JSON.stringify(log));
        }
    }
};
