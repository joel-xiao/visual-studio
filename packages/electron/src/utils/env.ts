import { app } from 'electron';

export const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
export const isProd = !isDev;
export const isPackaged = app.isPackaged;

export const devServerURL = 'http://localhost:1420';
