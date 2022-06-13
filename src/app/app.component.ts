import { Component, ViewEncapsulation, OnInit, AfterViewInit } from '@angular/core';
import { Puzzle } from './puzzle';
import { PuzzleService } from './puzzle.service';
import { Router } from '@angular/router';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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

  constructor(private puzzleService: PuzzleService, private router : Router, private store: Firestore, private auth: Auth) {
    const col = collection(store, 'puzzle-store');
    this.item$ = collectionData(col) as Observable<Puzzle[]>;
    console.log(this.item$);
  }

  createPuzzleLink(puzzle : Puzzle) : HTMLElement {
      var routerLink = document.createElement("div");
      routerLink.classList.add("puzzle-link");
      var puzzleTitle = document.createElement("div");
      puzzleTitle.classList.add("puzzle-title");
      puzzleTitle.innerHTML = "<span style=\"align-self: center;\">" + puzzle.title + "</span>";
      routerLink.appendChild(puzzleTitle);
      var puzzleIcon = document.createElement("img");
      if(puzzle.height < 15){
        puzzleIcon.src = "./../../assets/xword-mini-icon.jpg";
      }
      else{
        puzzleIcon.src = "./../../assets/xword-icon-large.jpg";
      }
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
    /*document.getElementById('sign-in-button')!.addEventListener("click", (event) => {
      var provider = new GoogleAuthProvider();
      signInWithPopup(this.auth, provider).then(function(result) {
        //var token = result.credential.accessToken;
        var user = result.user;
        document.getElementById('sign-in-button')!.innerHTML = "Sign In Again!";
        //console.log(token)
        console.log(user)
      }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
      
        console.log(error.code)
        console.log(error.message)
      });
    })*/
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

  getCreateLink(): HTMLElement {
    var routerLink = document.createElement("div");
    routerLink.classList.add("puzzle-link");
    routerLink.classList.add("create-link");
    var puzzleTitle = document.createElement("div");
    puzzleTitle.classList.add("puzzle-title");
    puzzleTitle.innerHTML = "<span style=\"align-self: center;\">Create +</span>";
    routerLink.appendChild(puzzleTitle);
    var puzzleSize = document.createElement("div");
    routerLink.addEventListener("click", () => {
      this.router.navigateByUrl('/create');
    });

    return routerLink;
  }

  getPuzzlesFromDB(): void {
    this.clearPuzzleNav();
    this.puzzleService.getPuzzlesFromDB().subscribe(
      puzzles => {
        var counter = 0;
          var nav = document.getElementById("nav-table");
        var rowDOM = document.createElement("div");
        this.clearPuzzleNav();
        for(var i = puzzles.length-1; i >= 0; i--){
          var puzzle = puzzles[i]
          counter = counter + 1;
          rowDOM!.appendChild(this.createPuzzleLink(puzzle));
        }
        rowDOM!.appendChild(this.getCreateLink());
        if(counter > 0){
          nav!.appendChild(rowDOM);
        }
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
