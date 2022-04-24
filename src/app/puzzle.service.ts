import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Puzzle } from './puzzle';
import { PUZZLES } from './mock-puzzles';
import { AppModule } from './app.module';
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import { environment } from '../environments/environment';
import { initializeApp } from "firebase/app";

@Injectable({
  providedIn: 'root'
})
export class PuzzleService {

  constructor() {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);
    const docRef = doc(db, "puzzle-store", "fxnkTbQ5aFWgLNHiKsE5");
    //const docSnap = await getDoc(docRef);
  }

  getPuzzles(): Observable<Puzzle[]> {
    const puzzles = of(PUZZLES);
    return puzzles;
  }
}
