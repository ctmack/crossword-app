import { Component, ViewEncapsulation, OnInit, AfterViewInit } from '@angular/core';
import { Puzzle } from './puzzle';
import { PuzzleService } from './puzzle.service';
import { Router } from '@angular/router';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  puzzles : Puzzle[] = [];
  item$: Observable<Puzzle[]>;


  selectedPuzzle?: Puzzle;
  onSelect(puzzle: Puzzle): void {
    this.selectedPuzzle = puzzle;
  }

  constructor(private puzzleService: PuzzleService, private router : Router, private store: Firestore) {
    const col = collection(store, 'puzzle-store');
    this.item$ = collectionData(col) as Observable<Puzzle[]>;
    console.log(this.item$);
  }

  createPuzzleLink(puzzle : Puzzle) : HTMLElement {
      var routerLink = document.createElement("th");
      routerLink.classList.add("puzzle-link");
      var puzzleTitle = document.createElement("div");
      puzzleTitle.classList.add("puzzle-title");
      puzzleTitle.innerHTML = "<span style=\"align-self: center;\">" + puzzle.title + "</span>";
      routerLink.appendChild(puzzleTitle);
      var puzzleIcon = document.createElement("img");
      puzzleIcon.src = "./../../assets/xword-icon-large.jpg";
      puzzleIcon.classList.add("puzzle-icon");
      routerLink.appendChild(puzzleIcon);
      var puzzleDate = document.createElement("div");
      puzzleDate.classList.add("puzzle-date");
      //date formatting here
      puzzleDate.innerHTML = puzzle.date;
      routerLink.appendChild(puzzleDate);
      var puzzleSize = document.createElement("div");
      puzzleSize.classList.add("puzzle-size");
      puzzleSize.innerHTML = puzzle.height.toString() + " x " + puzzle.width.toString();
      routerLink.appendChild(puzzleSize);
      console.log(puzzle["id"]);
      routerLink.addEventListener("click", () => {
        this.router.navigateByUrl('/puzzle/' + puzzle["id"]);
      });
      return routerLink;
  }

  ngOnInit(): void {
    this.getPuzzlesFromDB();
    /*var nav = document.getElementById("nav-table");
    var counter = 0;
    var rowDOM = document.createElement("tr");
    for(var i = this.puzzles.length-1; i >= 0; i--){
      var puzzle = this.puzzles[i]
      counter = counter + 1;
      rowDOM!.appendChild(this.createPuzzleLink(puzzle));
      if(counter == 4){
        counter = 0;
        nav!.appendChild(rowDOM);
        rowDOM! = document.createElement("tr");
      }
    }
    if(counter > 0){
      nav!.appendChild(rowDOM);
    }*/
  }

  ngOnDestroy(): void {
    (<HTMLElement> document.getElementById("headline-sub-title")).innerHTML = "";
  }

  getPuzzle(id : String): Puzzle | undefined {
    for(var puzzle of this.puzzles){
      if(puzzle.id == id){
        return puzzle;
      }
    }
    return undefined;
  }

  clearPuzzleNav(): void{
    const navDOM = document.getElementById('nav-table');
    while (navDOM!.firstChild) {
      navDOM!.removeChild(navDOM!.firstChild);
    }
  }

  getPuzzlesFromDB(): void {
    this.puzzleService.getPuzzlesFromDB().subscribe(
      puzzles => {
        var counter = 0;
        this.clearPuzzleNav()
        var nav = document.getElementById("nav-table");
        var rowDOM = document.createElement("tr");
        for(var i = puzzles.length-1; i >= 0; i--){
          var puzzle = puzzles[i]
          counter = counter + 1;
          rowDOM!.appendChild(this.createPuzzleLink(puzzle));
          if(counter == 4){
            counter = 0;
            nav!.appendChild(rowDOM);
            rowDOM! = document.createElement("tr");
          }
        }
        if(counter > 0){
          nav!.appendChild(rowDOM);
        }
        console.log(puzzles);
        this.puzzles = puzzles;
      }
    );
  }


  getPuzzles(): void {
      this.puzzleService.getPuzzles().subscribe(
        puzzles => {
          this.puzzles = puzzles;
        }
      );
  }

}
