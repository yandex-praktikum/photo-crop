import {
	cropReducer,
	InitialCropState,
} from '../src/components/Cropper/Reducer';

describe('cropReducer', () => {
	it('should return the initial state', () => {
		expect(cropReducer(InitialCropState, { type: 'RESET' })).toEqual({
			cropSettings: [{ box: { x: 0, y: 0, width: 0, height: 0 } }],
			selected: 0,
		});
	});

	it('should handle SELECT', () => {
		expect(
			cropReducer(InitialCropState, { type: 'SELECT', payload: 1 })
		).toEqual({
			cropSettings: [{ box: { x: 0, y: 0, width: 0, height: 0 } }],
			selected: 1,
		});
	});

	it('should handle ADD_CROPPER', () => {
		expect(cropReducer(InitialCropState, { type: 'ADD_CROPPER' })).toEqual({
			cropSettings: [
				{ box: { x: 0, y: 0, width: 0, height: 0 } },
				{ box: { x: 0, y: 0, width: 0, height: 0 } },
			],
			selected: 1,
		});

		expect(
			cropReducer(InitialCropState, { type: 'ADD_CROPPER', payload: 2 })
		).toEqual({
			cropSettings: [
				{ box: { x: 0, y: 0, width: 0, height: 0 } },
				{ box: { x: 0, y: 0, width: 0, height: 0 } },
				{ box: { x: 0, y: 0, width: 0, height: 0 } },
			],
			selected: 0,
		});
	});

	it('should handle REMOVE_CROPPER', () => {
		expect(
			cropReducer(
				{
					cropSettings: [
						{ box: { x: 0, y: 0, width: 0, height: 0 } },
						{ box: { x: 0, y: 0, width: 0, height: 0 } },
					],
					selected: 1,
				},
				{ type: 'REMOVE_CROPPER', payload: 1 }
			)
		).toEqual({
			cropSettings: [{ box: { x: 0, y: 0, width: 0, height: 0 } }],
			selected: 0,
		});
	});

	it('should handle CHANGE_BOX', () => {
		expect(
			cropReducer(
				{
					cropSettings: [{ box: { x: 0, y: 0, width: 0, height: 0 } }],
					selected: 0,
				},
				{ type: 'CHANGE_BOX', payload: { x: 1, y: 2, width: 3, height: 4 } }
			)
		).toEqual({
			cropSettings: [{ box: { x: 1, y: 2, width: 3, height: 4 } }],
			selected: 0,
		});
	});

	it('should handle CHANGE_SIZE', () => {
		// first change
		expect(
			cropReducer(InitialCropState, {
				type: 'CHANGE_SIZE',
				payload: {
					rendered: { width: 100, height: 200 },
					natural: { width: 100, height: 200 },
				},
			})
		).toEqual({
			cropSettings: [
				{
					box: { x: 0, y: 0, width: 100, height: 200 },
					size: {
						image: {
							rendered: { width: 100, height: 200 },
							natural: { width: 100, height: 200 },
						},
						min: { width: 50, height: 50 },
						max: { width: 100, height: 200 },
					},
				},
			],
			selected: 0,
		});

		// rescale
		expect(
			cropReducer(
				{
					cropSettings: [
						{
							box: { x: 0, y: 0, width: 100, height: 200 },
							size: {
								image: {
									rendered: { width: 100, height: 200 },
									natural: { width: 100, height: 200 },
								},
								min: { width: 50, height: 50 },
								max: { width: 100, height: 200 },
							},
						},
					],
					selected: 0,
				},
				{
					type: 'CHANGE_SIZE',
					payload: {
						rendered: { width: 50, height: 100 },
						natural: { width: 100, height: 200 },
					},
				}
			)
		).toEqual({
			cropSettings: [
				{
					box: { x: 0, y: 0, width: 50, height: 100 },
					size: {
						image: {
							rendered: { width: 50, height: 100 },
							natural: { width: 100, height: 200 },
						},
						min: { width: 25, height: 25 },
						max: { width: 50, height: 100 },
					},
				},
			],
			selected: 0,
		});
	});
});
