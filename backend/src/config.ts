import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MAX_CROP_SIZE = process.env.MAX_CROP_SIZE
	? parseInt(process.env.MAX_CROP_SIZE)
	: 1000;
