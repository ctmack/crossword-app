import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Puzzle } from './puzzle';
import { PUZZLES } from './mock-puzzles';

@Injectable({
  providedIn: 'root'
})
export class PuzzleService {

  constructor() { }

  getPuzzles(): Observable<Puzzle[]> {
    const puzzles = of(PUZZLES);
    return puzzles;
  }
}
