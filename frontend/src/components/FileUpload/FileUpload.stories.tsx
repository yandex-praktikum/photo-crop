import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { FileUpload } from './FileUpload';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: 'Component/FileUpload',
	component: FileUpload,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {},
	// Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
	args: {
		onChange: fn(),
	},
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
	args: {
		value: [],
		fileTypes: ['image/jpeg', 'image/png'],
		maxSize: 1024 * 1024,
	},
};

export const WithValue: Story = {
	args: {
		value: [new File([''], 'file.jpg')],
		fileTypes: ['image/jpeg', 'image/png'],
		maxSize: 1024 * 1024,
		maxCount: 1,
	},
};
