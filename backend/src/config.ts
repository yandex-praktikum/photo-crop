import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MAX_CROP_SIZE = process.env.MAX_CROP_SIZE
	? parseInt(process.env.MAX_CROP_SIZE)
	: 1000;

export const UPLOAD_DIR = process.env.UPLOAD_DIR
	? path.resolve(process.env.UPLOAD_DIR)
	: os.tmpdir();
