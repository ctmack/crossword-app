import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Puzzle } from './puzzle';
import { PUZZLES } from './mock-puzzles';
import { AppModule } from './app.module';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { environment } from '../environments/environment';
import { initializeApp } from "firebase/app";
import { Firestore, collectionData, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PuzzleService {

  item$: Observable<Puzzle[]>;

  constructor(private store: Firestore) {
    const col = collection(store, 'puzzle-store');
    this.item$ = collectionData(col) as Observable<Puzzle[]>;
    //const app = initializeApp(environment.firebaseConfig);
    //const db = getFirestore(app);
    //const docRef = doc(db, "puzzle-store", "fxnkTbQ5aFWgLNHiKsE5");
    //const docSnap = await getDoc(docRef);
  }

  getPuzzlesFromDB(): Observable<Puzzle[]> {
    const col = collection(this.store, 'puzzle-store');
    return collectionData(col) as Observable<Puzzle[]>;
  }


  getPuzzles(): Observable<Puzzle[]> {
    const puzzles = of(PUZZLES);
    return puzzles;
  }
}
