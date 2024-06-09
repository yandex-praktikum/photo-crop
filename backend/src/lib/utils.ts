export const getCurrentDateTime = () => {
	const d = new Date();
	return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}_${d.getHours()}:${d.getMinutes()}`;
};
