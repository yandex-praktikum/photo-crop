import { Joi } from 'celebrate';
import { MAX_CROP_SIZE } from '../config';

// Окно для обрезки
export interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

// Задание на обрезку
export interface CropTask {
	photo: string;
	fileName: string;
	box: Box;
}

// Обрезанный файл
export interface CroppedFile {
	file: string;
	name: string;
}

// Задание на архивацию
export interface ArchiveTask {
	files: CroppedFile[];
	fileName: string;
}

export const joiInteger = Joi.number().integer().min(0).max(MAX_CROP_SIZE);

export const boxSchema = Joi.object().keys({
	width: joiInteger.required(),
	height: joiInteger.required(),
	x: joiInteger.required(),
	y: joiInteger.required(),
});

// Файлы уже загружены, так что здесь только задание на их обрезку
export const cropTaskSchema = Joi.array()
	.items(
		Joi.object().keys({
			// id для идентификации фото в директории загрузки
			photo: Joi.string().guid({ version: 'uuidv4' }).required(),
			// отсюда для формирования пути возьмем только расширение, а само имя используем в архиве
			fileName: Joi.string().trim().min(1).max(100).required(),
			// область для обрезки
			box: boxSchema.required(),
		})
	)
	.min(1)
	.max(10);
