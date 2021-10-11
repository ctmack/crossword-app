export interface Puzzle {
	id: number;
	title: string;
	date: string;
	grid: string[][];
	acrossClues: string[];
	downClues: string[];
}