import { Component, ViewEncapsulation, OnInit, AfterViewInit } from '@angular/core';
import { Puzzle } from './puzzle';
import { PuzzleService } from './puzzle.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = "Colin's Crosswords";

  /*constructor(private router : Router) {
  }

  ngAfterViewInit(): void {
    //(<HTMLElement> document.getElementById("headline-title")).innerHTML = "";
    (<HTMLElement> document.getElementById("headline-sub-title")).innerHTML = "";
    this.router.navigateByUrl('/crosswords');
  }*/

  puzzles : Puzzle[] = [];

  selectedPuzzle?: Puzzle;
  onSelect(puzzle: Puzzle): void {
    this.selectedPuzzle = puzzle;
  }

  constructor(private puzzleService: PuzzleService, private router : Router) { }

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
      puzzleDate.innerHTML = puzzle.date;
      routerLink.appendChild(puzzleDate);
      var puzzleSize = document.createElement("div");
      puzzleSize.classList.add("puzzle-size");
      puzzleSize.innerHTML = puzzle.grid.length.toString() + " x " + puzzle.grid.length.toString();
      routerLink.appendChild(puzzleSize);
      routerLink.addEventListener("click", () => {
        this.router.navigateByUrl('/puzzle/' + puzzle["id"], { state: {id: puzzle["id"]} });
      });
      return routerLink;
  }

  ngOnInit(): void {
    this.getPuzzles();
    var nav = document.getElementById("nav-table");
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
    }
  }

  ngOnDestroy(): void {
    (<HTMLElement> document.getElementById("headline-sub-title")).innerHTML = "";
  }


  getPuzzles(): void {
      this.puzzleService.getPuzzles().subscribe(
        puzzles => {
          this.puzzles = puzzles;
        }
      );
  }

}
