export interface Puzzle {
	id: string;
	title: string;
	author: string;
	authorEmail: string;
	authorUID: string;
	date: string;
	displayDate: string;
	grid: string;
	height: number;
	width: number;
	key: string;
	acrossClues: string;
	downClues: string;
}