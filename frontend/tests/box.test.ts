import {
	isBoxInside,
	limit,
	limitBoxChange,
	limitSideInRange,
} from '../src/utils/box';

// Подготовим типы для описания набора тестов
type BoxValues = [number, number, number, number];
type SideValues = [number, number];
type FixtureRow<T> = [string, T, T, T];

// Дефолтные значения для тестов
const min = {
	width: 5,
	height: 5,
};
const max = {
	width: 10,
	height: 10,
};

describe('Base calculations', () => {
	test('should limit value', () => {
		expect(limit(10, 0, 5)).toBe(5);
		expect(limit(10, 0, 15)).toBe(10);
		expect(limit(10, 5, 15)).toBe(10);
		expect(limit(-10, 0, 15)).toBe(0);
	});

	test('should check is box inside container', () => {
		expect(
			isBoxInside(
				{
					x: 0,
					y: 0,
					width: 5,
					height: 5,
				},
				{
					width: 10,
					height: 10,
				}
			)
		).toBe(true);
		expect(
			isBoxInside(
				{
					x: 0,
					y: 0,
					width: 15,
					height: 15,
				},
				{
					width: 10,
					height: 10,
				}
			)
		).toBe(false);
		expect(
			isBoxInside(
				{
					x: 5,
					y: 5,
					width: 5,
					height: 5,
				},
				{
					width: 10,
					height: 10,
				}
			)
		).toBe(true);
		expect(
			isBoxInside(
				{
					x: -5,
					y: -5,
					width: 5,
					height: 5,
				},
				{
					width: 10,
					height: 10,
				}
			)
		).toBe(false);
	});

	// Самый важный тест, который проверяет все возможные варианты изменения по одной оси
	describe('limitSideInRange', () => {
		const fixtures: FixtureRow<SideValues>[] = [
			['increase width inside box', [0, 5], [0, 1], [0, 6]],
			['increase width outside box', [0, 5], [0, 10], [0, 10]],
			['decrease width inside box', [0, 6], [0, -1], [0, 5]],
			['decrease width outside box', [0, 5], [0, -10], [0, 5]],
			['move positive inside box', [0, 5], [1, 0], [1, 5]],
			['move negative inside box with offset', [5, 5], [-1, 0], [4, 5]],
			['move outside box', [0, 5], [-1, 0], [0, 5]],
			['move outside box to max', [0, 5], [10, 0], [5, 5]],
			['move outside box to min', [5, 5], [-10, 0], [0, 5]],
			['move and resize inside box right', [0, 8], [1, -1], [1, 7]],
			[
				'move and resize inside box right with min width',
				[0, 5],
				[1, -1],
				[0, 5],
			],
			[
				'move and resize inside box right with min width and offset',
				[2, 6],
				[2, -2],
				[3, 5],
			],
			[
				'move and resize inside box right with min width and offset 2',
				[2, 5],
				[2, -2],
				[2, 5],
			],
			['move and resize inside box left', [5, 5], [-1, 1], [4, 6]],
			['move and resize inside box left out', [5, 5], [-10, 10], [0, 10]],
			['move and resize outside box to min', [0, 5], [-1, 1], [0, 5]],
			['move and resize outside box to max', [5, 5], [1, -1], [5, 5]],
		];

		// Вместо того чтобы писать много тестов, мы можем использовать test.each
		test.each(fixtures)('should %s', (_, side, change, result) => {
			expect(
				limitSideInRange(
					side[0],
					side[1],
					change[0],
					change[1],
					min.width,
					max.width
				)
			).toEqual(result);
		});
	});

	// Самый сложный тест, который проверяет все возможные варианты изменения по двум осям
	// моделируем смещение контролов в браузере мышью
	describe('limitBoxChange', () => {
		const fixtures: FixtureRow<BoxValues>[] = [
			['increase width inside box', [0, 0, 5, 5], [0, 0, 1, 0], [0, 0, 6, 5]],
			['increase height inside box', [0, 0, 5, 5], [0, 0, 0, 1], [0, 0, 5, 6]],
			[
				'increase width and height inside box',
				[0, 0, 5, 5],
				[0, 0, 1, 1],
				[0, 0, 6, 6],
			],
			[
				'increase width outside box',
				[0, 0, 5, 5],
				[0, 0, 10, 0],
				[0, 0, 10, 5],
			],
			[
				'increase width outside box moved',
				[1, 1, 5, 5],
				[0, 0, 10, 0],
				[1, 1, 9, 5],
			],
			[
				'increase height outside box',
				[0, 0, 5, 5],
				[0, 0, 0, 10],
				[0, 0, 5, 10],
			],
			[
				'increase width and height outside box',
				[0, 0, 5, 5],
				[0, 0, 10, 10],
				[0, 0, 10, 10],
			],
			['decrease width inside box', [0, 0, 6, 5], [0, 0, -1, 0], [0, 0, 5, 5]],
			['decrease height inside box', [0, 0, 5, 6], [0, 0, 0, -1], [0, 0, 5, 5]],
			[
				'decrease width and height inside box',
				[0, 0, 6, 6],
				[0, 0, -1, -1],
				[0, 0, 5, 5],
			],
			[
				'decrease width outside box',
				[0, 0, 5, 5],
				[0, 0, -10, 0],
				[0, 0, 5, 5],
			],
			[
				'decrease width outside box to min',
				[0, 0, 6, 5],
				[0, 0, -10, 0],
				[0, 0, 5, 5],
			],
			[
				'decrease height outside box',
				[0, 0, 5, 5],
				[0, 0, 0, -10],
				[0, 0, 5, 5],
			],
			[
				'decrease height outside box to min',
				[0, 0, 5, 6],
				[0, 0, 0, -10],
				[0, 0, 5, 5],
			],
			[
				'decrease width and height outside box',
				[0, 0, 5, 5],
				[0, 0, -10, -10],
				[0, 0, 5, 5],
			],
			[
				'decrease width and height outside box to min',
				[0, 0, 6, 7],
				[0, 0, -10, -10],
				[0, 0, 5, 5],
			],
			['move positive inside box', [0, 0, 5, 5], [1, 1, 0, 0], [1, 1, 5, 5]],
			[
				'move negative inside box with offset',
				[4, 4, 5, 5],
				[-1, -1, 0, 0],
				[3, 3, 5, 5],
			],
			['move outside box', [0, 0, 5, 5], [-1, -1, 0, 0], [0, 0, 5, 5]],
			['move outside box to max', [0, 0, 5, 5], [10, 10, 0, 0], [5, 5, 5, 5]],
			['move outside box to min', [2, 3, 5, 5], [-5, -5, 0, 0], [0, 0, 5, 5]],
			[
				'move and resize up inside box',
				[0, 0, 5, 5],
				[1, 1, 1, 1],
				[0, 0, 5, 5],
			], // can not be resized that way
			[
				'move and resize down inside box no place to change',
				[0, 0, 5, 5],
				[1, 1, -1, -1],
				[0, 0, 5, 5],
			],
			[
				'move and resize outside box to min',
				[0, 0, 10, 10],
				[10, 10, -10, -10],
				[5, 5, 5, 5],
			],
			[
				'move and resize outside box to max',
				[5, 5, 5, 5],
				[-10, -10, 10, 10],
				[0, 0, 10, 10],
			],
		];

		test.each(fixtures)('should %s', (_, box, change, result) => {
			expect(
				limitBoxChange(
					{
						x: box[0],
						y: box[1],
						width: box[2],
						height: box[3],
					},
					{
						x: change[0],
						y: change[1],
						width: change[2],
						height: change[3],
					},
					min,
					max
				)
			).toEqual({
				x: result[0],
				y: result[1],
				width: result[2],
				height: result[3],
			});
		});
	});
});
