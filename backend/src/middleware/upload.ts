// Configure Multer with unique identifiers for filenames
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_DIR } from '../config';

const storage = multer.diskStorage({
	destination: function (_req, _file, cb) {
		cb(null, UPLOAD_DIR);
	},
	filename: function (_req, file, cb) {
		// Use uuidv4 to generate a unique identifier for each file
		const id = uuidv4();
		const fileExtension = file.originalname.split('.').pop();
		cb(null, `${id}.${fileExtension}`);
	},
});

export const upload = multer({ storage: storage });
