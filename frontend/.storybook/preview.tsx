import type { Preview } from '@storybook/react';
import '../src/index.scss';
import './preview.scss';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
	decorators: [
		(Story) => (
			<div>
				<Story />
			</div>
		),
	],
};

export default preview;
