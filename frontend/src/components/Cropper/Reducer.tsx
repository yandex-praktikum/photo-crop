import { Box, getScale, scaleBox, scaleSize, Size } from '../../utils/box.ts';
import { ImageSize } from '../ImagePreview/ImagePreview.tsx';
import { Reducer } from 'react';

export type CropBox = {
	box: Box;
	size?: {
		image: ImageSize;
		min: Size;
		max: Size;
	};
};

export type CropState = {
	cropSettings: CropBox[];
	selected: number;
};

export type CropActions =
	| { type: 'RESET' }
	| { type: 'SELECT'; payload: number }
	| { type: 'ADD_CROPPER'; payload?: number }
	| { type: 'REMOVE_CROPPER'; payload: number }
	| { type: 'CHANGE_BOX'; payload: Box }
	| { type: 'CHANGE_SIZE'; payload: ImageSize };

export const InitialCropBox: CropBox = {
	box: {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	},
	size: undefined,
};

export const InitialCropState: CropState = {
	cropSettings: [InitialCropBox],
	selected: 0,
};

export const cropReducer: Reducer<CropState, CropActions> = (state, action) => {
	switch (action.type) {
		case 'RESET':
			return Object.assign({}, InitialCropState);
		case 'SELECT':
			return {
				...state,
				selected: action.payload,
			};
		case 'ADD_CROPPER':
			return {
				selected: action.payload ? state.selected : state.selected + 1,
				cropSettings: [
					...state.cropSettings,
					...Array.from({ length: action.payload || 1 }, () =>
						Object.assign({}, InitialCropBox)
					),
				],
			};
		case 'REMOVE_CROPPER':
			if (state.cropSettings.length === 1)
				return Object.assign({}, InitialCropState);
			else
				return {
					...state,
					cropSettings: state.cropSettings.filter(
						(_, i) => i !== action.payload
					),
					selected: state.selected >= 1 ? state.selected - 1 : 0,
				};
		case 'CHANGE_BOX':
			return {
				...state,
				cropSettings: state.cropSettings.map((crop, i) =>
					i === state.selected ? { ...crop, box: action.payload } : crop
				),
			};
		case 'CHANGE_SIZE':
			return {
				...state,
				cropSettings: state.cropSettings.map((crop, i) => {
					if (i === state.selected) {
						if (!crop.size) {
							return {
								size: {
									image: action.payload,
									min: {
										width: 50,
										height: 50,
									},
									max: {
										width: action.payload.rendered.width,
										height: action.payload.rendered.height,
									},
								},
								box: {
									x: 0,
									y: 0,
									width: action.payload.rendered.width,
									height: action.payload.rendered.height,
								},
							};
						} else {
							const scale = getScale(
								crop.size.image.rendered,
								action.payload.rendered
							);
							return {
								box: scaleBox(crop.box, scale),
								size: {
									image: action.payload,
									min: scaleSize(crop.size!.min, scale),
									max: scaleSize(crop.size!.max, scale),
								},
							};
						}
					}
					return crop;
				}),
			};
		default:
			return state;
	}
};
