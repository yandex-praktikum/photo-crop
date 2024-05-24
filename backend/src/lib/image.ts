import sharp from 'sharp';
import { Box } from './types';

export function cropImage(input: string, output: string, box: Box) {
	return sharp(input)
		.extract({
			width: box.width,
			height: box.height,
			left: box.x,
			top: box.y,
		})
		.toFile(output);
}
