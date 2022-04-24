export interface Puzzle {
	id: string;
	title: string;
	date: string;
	grid: string;
	height: number;
	width: number;
	key: string;
	acrossClues: string;
	downClues: string;
}