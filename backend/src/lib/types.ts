import { Joi } from 'celebrate';
import { MAX_CROP_SIZE } from '../config';

export interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

export const joiInteger = Joi.number().integer().min(0).max(MAX_CROP_SIZE);

export const boxSchema = Joi.object().keys({
	width: joiInteger.required(),
	height: joiInteger.required(),
	x: joiInteger.required(),
	y: joiInteger.required(),
});
