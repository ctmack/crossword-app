import { Component, ViewEncapsulation, OnInit, AfterViewInit } from '@angular/core';
import { Puzzle } from './puzzle';
import { PuzzleService } from './puzzle.service';
import { Router } from '@angular/router';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
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
  user: User | null = null;


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
      var puzzleAuthor = document.createElement("div");
      puzzleAuthor.classList.add("puzzle-author");
      puzzleAuthor.innerHTML = "By " + puzzle.author;
      routerLink.appendChild(puzzleAuthor);
      var puzzleDate = document.createElement("div");
      puzzleDate.classList.add("puzzle-date");
      //date formatting here
      puzzleDate.innerHTML = puzzle.displayDate;
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
    document.getElementById('sign-in-button')!.addEventListener("click", (event) => {
      if(this.user == null){
        var provider = new GoogleAuthProvider();
        signInWithPopup(this.auth, provider).then( (result) => {
          //var token = result.credential.accessToken;
          this.user = result.user;
          document.getElementById('sign-in-button')!.innerHTML = "(Sign Out)";
          document.getElementById('sign-in-button')!.classList.add("sign-out");
          document.getElementById('welcome-msg')!.innerHTML = "Hello, " + this.user.displayName!.split(" ")[0];
          document.getElementById('submit-overlay-button')!.innerHTML = "Submit";
          document.getElementById('submit-overlay-button')!.classList.remove("review-disabled");
          //console.log(token)
          console.log(this.user);
        }).catch(function(error) {
          console.log(error.code);
          console.log(error.message);
        });
      }
      else{
        signOut(this.auth).then(() => {
          this.user = null;
          document.getElementById('sign-in-button')!.innerHTML = "Sign In";
          document.getElementById('sign-in-button')!.classList.remove("sign-out");
          document.getElementById('welcome-msg')!.innerHTML = "";
          document.getElementById('submit-overlay-button')!.innerHTML = "Sign in to submit";
          document.getElementById('submit-overlay-button')!.classList.add("review-disabled");
        }).catch((error) => {
          console.log(error.code)
          console.log(error.message)
        });
      }
    })
  }

  ngOnDestroy(): void {
    (<HTMLElement> document.getElementById("headline-sub-title")).innerHTML = "";
  }

  getPuzzle(id : String): Puzzle | undefined {
    console.log("appId:" + id);
    console.log("appPuzzles:" + this.puzzles);
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
