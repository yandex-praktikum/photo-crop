declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string | undefined;
			PORT: string;
			MAX_CROP_SIZE: string;
			NODE_ENV: 'development' | 'production';
		}
	}
}
