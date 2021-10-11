import { Component, HostListener, ViewEncapsulation, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { AppRoutingModule } from './../app-routing.module'
import { Puzzle } from '../puzzle';
import { Router } from '@angular/router';
import { PuzzleService } from '../puzzle.service';
declare var $: any;

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PuzzleComponent implements OnInit, AfterViewInit {

  puzzles : Puzzle[] = [];
  puzzle?: Puzzle;
  puzzleId: number;
  count: number = 0;
  timer: number = 0;
  paused: boolean = false;
  gridElems: HTMLElement[] = [];
  focusAcross: boolean = true;
  puzzleComplete: boolean = false;

  constructor(private puzzleService: PuzzleService, private router : Router) {
    var puzzleState = this.router!.getCurrentNavigation()!.extras.state;
    if(puzzleState != undefined){
      this.puzzleId = this.router!.getCurrentNavigation()!.extras.state!["id"];
    }
    else{
      this.puzzleId = -1;
    }
  }

  ngOnInit(): void {
    document.getElementById("nav-table")!.style.display="none";
    this.getPuzzle(this.puzzleId);
    if(this.puzzle == undefined){
      this.router.navigateByUrl('/');
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    document.getElementById("nav-table")!.style.display="block";
    (<HTMLElement> document.getElementById("headline-sub-title")).innerHTML = "";
  }

  ngAfterViewInit(): void {
    if(this.puzzle == undefined){
      return;
    }
    (<HTMLElement> document.getElementById("headline-sub-title")).innerHTML = "|<span style=\"margin-left:20px\">" + this.puzzle.title + "</span>";
    this.populateClues();
    this.buildTable();
    this.setClueHeader(<HTMLElement> document.getElementsByClassName("clue")![0]);
    this.counter();
    document.getElementById('timer-start-pause-button')!.addEventListener("click", () => {

      clearTimeout(this.timer);

      this.paused = !this.paused;
      if(!this.paused) {
        this.counter();
        document.getElementById("timer")!.style.color="black";
        (<HTMLElement> document.getElementsByClassName("clue-section-listing")![0]).style.backgroundColor="#FFF";
        (<HTMLElement> document.getElementsByClassName("clue-section-listing")![1]).style.backgroundColor="#FFF";
        document.getElementById("clue-header-text")!.classList.remove("hidden");
        document.getElementById("clue-header-number")!.classList.remove("hidden");
        this.unhideClues();
      }
      else{
        //clear header clue
        (<HTMLElement> document.getElementsByClassName("clue-section-listing")![0]).style.backgroundColor="#EFEFEF";
        (<HTMLElement> document.getElementsByClassName("clue-section-listing")![1]).style.backgroundColor="#EFEFEF";
        document.getElementById("timer")!.style.color="#BBB";
        document.getElementById("clue-header-text")!.classList.add("hidden");
        document.getElementById("clue-header-number")!.classList.add("hidden");
        this.hideClues()
      }
    });
  }

  getPuzzle(id: number): void {
      this.puzzleService.getPuzzles().subscribe(
        puzzles => {
          this.puzzles = puzzles;
        }
      );
      for(var puzzle of this.puzzles){
        if(puzzle.id == id){
          this.puzzle = puzzle;
        }
      }
  }

  highlightWord(elem: HTMLElement) {
    for(var x = 0; x < this.gridElems.length; x++){
      this.gridElems[x].classList.remove("focus");
      this.gridElems[x].classList.remove("complement");
      this.gridElems[x].classList.remove("focus-word");
      if(this.focusAcross && (this.getAcrossFromElem(elem) == this.getAcrossFromElem(this.gridElems[x]))){
        this.gridElems[x].classList.add("focus-word");
      }
      else if(!this.focusAcross && (this.getDownFromElem(elem) == this.getDownFromElem(this.gridElems[x]))){
        this.gridElems[x].classList.add("focus-word");
      }
    }
    elem.classList.remove("focus-word");
    elem.classList.add("focus");
  }

  complementaryHighlights(clue: String){
    var clueId = "";
    var splitClue = clue.split(" ");
    for(var i = 0; i < splitClue.length; i++){
      if(splitClue[i].includes("-Across")){
        clueId = "A" + splitClue[i].split("-")[0];
      }
      else if(splitClue[i].includes("-Down")){
        clueId = "D" + splitClue[i].split("-")[0];
      }
    }
    for(var i = 0; i < this.gridElems.length; i++){
      if(this.gridElems[i].classList!.contains("inactive") ){
        continue;
      }
      var elemInfo = this.gridElems[i].getAttribute("info")!.split(/[A-Z]/);
      if(elemInfo.length == 3){
        elemInfo[1] = "A" + elemInfo[1];
        elemInfo[2] = "D" + elemInfo[2];
      }
      if(elemInfo.includes(clueId)){
        console.log(elemInfo);
        this.gridElems[i].classList.add("complement");
      }
    }

  }

  setClueHighlightFromElem(elem: HTMLElement){
    document.getElementsByClassName("clue-focus")[0].classList.remove("clue-focus");
    var clueElem;
    if(this.focusAcross){
      clueElem = document.getElementById("A" + this.getAcrossFromElem(elem));
      clueElem!.classList.add("clue-focus");
      this.setClueHeader(<HTMLElement> clueElem);
    }
    else{
      clueElem = document.getElementById("D" + this.getDownFromElem(elem));
    }
    clueElem!.classList.add("clue-focus");
    this.setClueHeader(<HTMLElement> clueElem);
    clueElem!.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  populateClues(){  
    this.makeClueObjects(<HTMLElement> document.getElementById('across-clues-listing'), this.puzzle!.acrossClues, "across-clue");
    this.makeClueObjects(<HTMLElement> document.getElementById('down-clues-listing'), this.puzzle!.downClues, "down-clue");

    document.getElementsByClassName("clue")![0].classList.add("clue-focus");
  }

  hideClues(){
    var clueDOMs = document.getElementsByClassName('clue');
    for(var i = 0; i < clueDOMs.length; i++){
      clueDOMs[i].classList.add("hidden");
    }
  }

  unhideClues(){  
    var clueDOMs = document.getElementsByClassName('clue');
    for(var i = 0; i < clueDOMs.length; i++){
      clueDOMs[i].classList.remove("hidden");
    }
  }

  setClueHeader(clueElem?: HTMLElement){
    if(clueElem == undefined){
      document.getElementById("clue-header-number")!.innerHTML = ""; 
      document.getElementById("clue-header-text")!.innerHTML = "";
    }
    else{
      if(clueElem.classList.contains("clue-number") || clueElem.classList.contains("clue-text")){
        clueElem = <HTMLElement> clueElem.parentElement;
      }
      document.getElementById("clue-header-number")!.innerHTML = (<HTMLElement> clueElem.childNodes[0]).innerHTML + clueElem.id[0]; 
      var clueText = (<HTMLElement> clueElem.childNodes[1]).innerHTML;
      document.getElementById("clue-header-text")!.innerHTML = clueText;
      if(clueText.includes("-Across") || clueText.includes("-Down")){
        this.complementaryHighlights(clueText);
      }
    }
  }

  makeClueObjects(listObj: HTMLElement, clueList: string[], className: string){
    for(var i = 0; i < clueList.length; i++){
      var clueDOM = document.createElement('div');
      var clueNumberDOM = document.createElement('div');
      clueNumberDOM.classList.add("clue-number");
      var clueTextDOM = document.createElement('div');
      clueTextDOM.classList.add("clue-text");
      clueDOM.classList.add("clue");
      clueDOM.classList.add(className);
      clueTextDOM.innerHTML = clueList[i];
      clueDOM.appendChild(clueNumberDOM);
      clueDOM.appendChild(clueTextDOM);

      clueDOM.addEventListener("mousedown", (event) => {
        var targetElem = <HTMLElement> event.target;
        if(targetElem!.classList!.contains("clue-number") || targetElem!.classList!.contains("clue-text")){
          targetElem = <HTMLElement> targetElem!.parentElement;
        }
        document.getElementsByClassName("clue-focus")[0].classList.remove("clue-focus");
        targetElem.classList.add("clue-focus");
        this.setFocusClue(<HTMLElement> event.target);
        this.setClueHeader(<HTMLElement> event.target);
      });

      listObj.appendChild(clueDOM);
    }
  }

  setFocusClue(elem: HTMLElement){
    if(elem!.classList!.contains("clue-number") || elem!.classList!.contains("clue-text")){
      elem = <HTMLElement> elem.parentElement;
    }  
    this.focusAcross = (elem.id[0] == "A");
    
    for(var i = 0; i < this.gridElems.length; i++){
      if(!this.gridElems[i].classList!.contains("inactive") && this.gridElems[i].getAttribute("info")!.includes(elem!.id)){
        this.highlightWord(this.gridElems[i]);
        return;
      }
    }
  }

  getAcrossFromElem(elem: HTMLElement): number{
    var info = elem.getAttribute("info");
    if(info == null){
      return 0;
    }
    var across = info.split(/[A-Z]/)[1];
    return +across;
  }

  getDownFromElem(elem: HTMLElement): number{
    var info = elem.getAttribute("info");
    if(info == null){
      return 0;
    }
    var down = info.split(/[A-Z]/)[2];
    return +down;
  }

  buildTable(){
    var tableDOM: HTMLElement | null = document.getElementById('crossword-table');
    var acrossCount: number = 0;
    var downCount: number = 0;
    var clueCount: number = 0;

    var rowCount: number = this.puzzle?.grid?.length ?? 0;
    for(var i = 0; i < rowCount; i++){
      var rowDOM = document.createElement('tr');
      var columnCount: number = this.puzzle?.grid?.length ?? 0;
      for(var j = 0; j < columnCount; j++){
        var squareDOM = document.createElement('th');
        if(this.puzzle?.grid[i][j] == "#"){
          squareDOM.classList.add("inactive");
          this.gridElems.push(squareDOM);
          rowDOM.appendChild(squareDOM);
          continue;
        }
        if(this.puzzle?.grid[i][j].includes(".")){
          squareDOM.classList.add("shaded");
        }

        var numberLabel: number = 0;
        var acrossVal: number = 0;
        var downVal: number = 0;

        if((j == 0 || this.puzzle?.grid[i][j-1] == "#") && (i == 0 || this.puzzle?.grid[i-1][j] == "#")){
          clueCount = clueCount + 1;
          acrossVal = clueCount;
          downVal = clueCount;
          numberLabel = clueCount;

          for(var x = 0; x < document.getElementsByClassName("across-clue").length; x++){          
            if(document.getElementsByClassName("across-clue")[x]["id"] == ""){
              document.getElementsByClassName("across-clue")[x]["id"] = "A" + numberLabel;
              var node = <HTMLElement> document.getElementsByClassName("across-clue")[x].childNodes[0];
              node.innerHTML = numberLabel.toString();
              break;
            }
          }
          for(var x = 0; x < document.getElementsByClassName("down-clue").length; x++){
            if(document.getElementsByClassName("down-clue")[x].id == ""){
              document.getElementsByClassName("down-clue")[x].id = "D" + numberLabel;
              var node = <HTMLElement> document.getElementsByClassName("down-clue")[x].childNodes[0];
              node.innerHTML = numberLabel.toString();
              break;
            }
          }
        }
        else{
          if(j == 0 || this.puzzle?.grid[i][j-1] == "#"){
            clueCount = clueCount + 1;
            acrossVal = clueCount;
            downVal = this.getDownFromElem(this.gridElems[this.gridElems.length - columnCount]);
            numberLabel = clueCount;

            for(var x = 0; x < document.getElementsByClassName("across-clue").length; x++){
              if(document.getElementsByClassName("across-clue")[x].id == ""){
                document.getElementsByClassName("across-clue")[x].id = "A" + numberLabel;
                var node = <HTMLElement> document.getElementsByClassName("across-clue")[x].childNodes[0];
                node.innerHTML = numberLabel.toString();
                break;
              }
            }
          }
          else if(i == 0 || this.puzzle?.grid[i-1][j] == "#"){
            clueCount = clueCount + 1;
            downVal = clueCount;
            acrossVal = this.getAcrossFromElem(this.gridElems[this.gridElems.length-1]);
            numberLabel = clueCount;

            for(var x = 0; x < document.getElementsByClassName("down-clue").length; x++){
              if(document.getElementsByClassName("down-clue")[x].id == ""){
                document.getElementsByClassName("down-clue")[x].id = "D" + numberLabel;
                var node = <HTMLElement> document.getElementsByClassName("down-clue")[x].childNodes[0];
                node.innerHTML = numberLabel.toString();
                break;
              }
            }
          }
          else{
            acrossVal = this.getAcrossFromElem(this.gridElems[this.gridElems.length-1]);
            downVal = this.getDownFromElem(this.gridElems[this.gridElems.length-columnCount]);
          }
        }
        squareDOM.setAttribute('info', "A" + acrossVal + "D" + downVal);


        squareDOM.addEventListener("click", (event) => {
          if(this.paused == true){
            return;
          }
          var targetElem = <HTMLElement> event.target;
          if(targetElem!.classList.contains("number-label") || targetElem!.classList.contains("grid-letter")){
            targetElem = <HTMLElement> targetElem!.parentElement;
          }
          if(targetElem.classList.contains("focus")){
            this.focusAcross = !this.focusAcross;
          }
          this.highlightWord(targetElem);
          this.setClueHighlightFromElem(targetElem);
        })



        var numberLabelDiv = document.createElement('div');
        numberLabelDiv.classList.add("number-label");
        if(numberLabel != 0){
          numberLabelDiv.innerHTML = numberLabel.toString();
        }
        squareDOM.appendChild(numberLabelDiv);

        var letterDiv = document.createElement('div');
        letterDiv.classList.add("grid-letter");
        squareDOM.appendChild(letterDiv);




        //add elements to their places in dom and in code
        this.gridElems.push(squareDOM);
        rowDOM.appendChild(squareDOM);

      }
      tableDOM?.appendChild(rowDOM);
    }

    var i = 0;
    while(this.gridElems[i].classList.contains("inactive")){
      i = i + 1;
    }
    this.highlightWord(this.gridElems[i]);

    var gridBoxHeight = (400 - ((rowCount*4) - 2)) / rowCount;
    gridBoxHeight = Math.round(gridBoxHeight);
    var crosswordTable = document.getElementById("crossword-table");
    var thList = crosswordTable!.getElementsByTagName("TH");
    for(var i = 0; i < thList.length; i++){
      (<HTMLElement> thList[i]).style.height = gridBoxHeight + "px";
      (<HTMLElement> thList[i]).style.width = gridBoxHeight + "px";      
    }

    var numberLabelList = document.getElementsByClassName("number-label");
    var gridBoxNumTop = ((Math.floor(gridBoxHeight/2)) * (-1)) + Math.round(parseInt(getComputedStyle(<HTMLElement> numberLabelList[0]).fontSize)/2) + 2;
    for(var i = 0; i < numberLabelList.length; i++){
      (<HTMLElement> numberLabelList[i]).style.top = gridBoxNumTop + "px";
    }
  }

  findNextOpen(){
    if(this.focusAcross){
      var x = 0;
      while(x < this.gridElems.length && !this.gridElems[x].classList.contains("focus")){
        x = x + 1;
      }
      x = x + 1;
      while(x < this.gridElems.length && this.gridElems[x].classList.contains("inactive")){
        x = x + 1;
      }
      if(x < this.gridElems!.length){
        this.highlightWord(this.gridElems[x]);
      }
    }
    else{
      var x = 0;
      while(x < this.gridElems.length && !this.gridElems[x].classList.contains("focus")){
        x = x + 1;
      }
      x = x + this.puzzle!.grid!.length;
      while(x < this.gridElems.length && this.gridElems[x].classList.contains("inactive")){
        x = x + this.puzzle!.grid!.length;
      }
      if(x < this.gridElems!.length){
        this.highlightWord(this.gridElems[x]);
      }
    }
  }

  findNextClue(elem: HTMLElement){
    if(this.focusAcross){
      var clue = this.getAcrossFromElem(elem);
      for(var i = 0; i < this.gridElems.length; i++){
        if(!this.gridElems[i].classList.contains("inactive") && this.getAcrossFromElem(this.gridElems[i]) > clue && (<HTMLElement> this.gridElems[i].childNodes[1]).innerHTML == ""){
          return this.gridElems[i];
        }
      }
    }
    else {
      var clue = this.getDownFromElem(elem);
      for(var i = 0; i < this.gridElems.length; i++){
        if(!this.gridElems[i].classList.contains("inactive") && this.getDownFromElem(this.gridElems[i]) > clue && (<HTMLElement> this.gridElems[i].childNodes[1]).innerHTML == ""){
          return this.gridElems[i];
        }
      }
    }
    return null;
  }

  nextOpenSpaceInCurrentClue(elem: HTMLElement){
    //get current info
    var clueArray = [];
    if(this.focusAcross){
      var clue = this.getAcrossFromElem(elem);
      for(var i = 0; i < this.gridElems.length; i++){
        if(clue == this.getAcrossFromElem(this.gridElems[i])){
          clueArray.push(this.gridElems[i]);
        }
      }
    }
    else{
      var clue = this.getDownFromElem(elem);
      for(var i = 0; i < this.gridElems.length; i++){
        if(clue == this.getDownFromElem(this.gridElems[i])){
          clueArray.push(this.gridElems[i]);
        }
      }
    }

    var x = 0;
    while(!clueArray[x].classList.contains("focus")){
      x = x + 1;
    }
    if(x == clueArray.length - 1){
      x = 0;
    }
    else{
      x = x + 1;
    }
    var runThroughs = 0;
    while((<HTMLElement> clueArray[x].childNodes[1]).innerHTML != ""){
      x = x + 1;
      if(x == clueArray.length){
        if(runThroughs > 0){
          return null;
        }
        x = 0;
        runThroughs = runThroughs + 1;
      }
    }
    return clueArray[x];
    //based on current info, and across=true/false, add on next number, cycle through
  }

  goLeft(){
    if(this.focusAcross){
      var lastValid = 0;
      var x = 0;
      while(x < this.gridElems.length && !this.gridElems[x].classList.contains("focus")){
        x = x + 1;
        lastValid = x;
      }
      x = x - 1;
      while(x > 0 && this.gridElems[x].classList.contains("inactive")){
        x = x - 1;
      }
      if(x >= 0 && !this.gridElems[x].classList.contains("inactive")){
        lastValid = x;
      }
      this.highlightWord(this.gridElems[lastValid]);
      this.setClueHighlightFromElem(this.gridElems[lastValid]);
    }
    else{
      this.focusAcross = !this.focusAcross;
      this.highlightWord(<HTMLElement> document.getElementsByClassName("focus")[0]);
      this.setClueHighlightFromElem(<HTMLElement> document.getElementsByClassName("focus")[0]);
    }
  }

  goUp(){
    if(!this.focusAcross){
      var lastValid = 0;
      var x = 0;
      var gridLength = this.gridElems.length;
      while(x < gridLength && !this.gridElems[x].classList.contains("focus")){
        x = x + 1;
        lastValid = x;
      }
      x = x - this.puzzle!.grid!.length;
      while(x > 0 && this.gridElems[x].classList.contains("inactive")){
        x = x - this.puzzle!.grid!.length;
      }
      if(x >= 0 && !this.gridElems[x].classList.contains("inactive")){
        lastValid = x;
      }
      this.highlightWord(<HTMLElement> this.gridElems[lastValid]);
      this.setClueHighlightFromElem(<HTMLElement> this.gridElems[lastValid]);
    }
    else{
      this.focusAcross = !this.focusAcross; 
      this.highlightWord(<HTMLElement> document.getElementsByClassName("focus")![0]);
      this.setClueHighlightFromElem(<HTMLElement> document.getElementsByClassName("focus")![0]);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(this.paused == true){
      return;
    }
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].indexOf(event.code) > -1) {
        event.preventDefault();
    }
    var gridLength = this.gridElems.length;
    if (event.keyCode >= 65 && event.keyCode <= 90){
      if(this.puzzleComplete){
        return;
      }
      (<HTMLElement> document.getElementsByClassName("focus")[0].childNodes[1]).innerHTML = String.fromCharCode(event.keyCode).toUpperCase();
      var nextSpace = this.nextOpenSpaceInCurrentClue(<HTMLElement> document.getElementsByClassName("focus")[0]);
      if(nextSpace == null){
        var nextClue = this.findNextClue(<HTMLElement> document.getElementsByClassName("focus")[0]);
        if(nextClue == null){
          this.checkAnswers();
          if(this.puzzleComplete){
            (<HTMLElement> document.getElementById("timer"))!.style.color = "rgb(114, 148, 130)";
            (<HTMLElement> document.getElementById("timer"))!.style.fontWeight = "bold";
            window.clearTimeout(this.timer);
          }
          return;
        }
        this.highlightWord(<HTMLElement> nextClue);
        this.setClueHighlightFromElem(<HTMLElement> nextClue);
      }
      else{
        this.highlightWord(<HTMLElement> nextSpace);
        this.setClueHighlightFromElem(<HTMLElement> nextSpace);
      }
    }
    if(event.keyCode == 8 || event.keyCode == 46){
      if((<HTMLElement> document.getElementsByClassName("focus")[0].childNodes[1]).innerHTML != ""){
        (<HTMLElement> document.getElementsByClassName("focus")[0].childNodes[1]).innerHTML = "";
      }
      else{
        if(this.focusAcross){
          this.goLeft();
          (<HTMLElement> document.getElementsByClassName("focus")[0].childNodes[1]).innerHTML = "";
        }
        else{
          this.goUp();
          (<HTMLElement> document.getElementsByClassName("focus")[0].childNodes[1]).innerHTML = "";
        }
      }
    }
    //Down
    if(event.keyCode == 40){
      if(!this.focusAcross){
        var x = 0;
        while(x < gridLength && !this.gridElems[x].classList.contains("focus")){
          x = x + 1;
        }
        x = x + this.puzzle!.grid!.length;
        while(x < gridLength && this.gridElems[x].classList.contains("inactive")){
          x = x + this.puzzle!.grid!.length;
        }
        if(x < gridLength){
          this.highlightWord(<HTMLElement> this.gridElems[x]);
          this.setClueHighlightFromElem(<HTMLElement> this.gridElems[x]);
        }
      }
      else{
        this.focusAcross = !this.focusAcross;
        this.highlightWord(<HTMLElement> document.getElementsByClassName("focus")[0]);
        this.setClueHighlightFromElem(<HTMLElement> document.getElementsByClassName("focus")[0]);
      }
    }
    //Up
    if(event.keyCode == 38){
      this.goUp();
    }
    //Left
    if(event.keyCode == 37){
      this.goLeft();
    }
    //Right
    if(event.keyCode == 39){
      if(this.focusAcross){
        var x = 0;
        while(x < gridLength && !this.gridElems[x]!.classList.contains("focus")){
          x = x + 1;
        }
        x = x + 1;
        while(x < gridLength && this.gridElems[x]!.classList.contains("inactive")){
          x = x + 1;
        }
        if(x < gridLength){
          this.highlightWord(this.gridElems[x]);
          this.setClueHighlightFromElem(this.gridElems[x]);
        }
      }
      else{
        this.focusAcross = !this.focusAcross;
        this.highlightWord(<HTMLElement> document.getElementsByClassName("focus")[0]);
        this.setClueHighlightFromElem(<HTMLElement> document.getElementsByClassName("focus")[0]);
      }
    }
    //Tab
    if (event.keyCode == 9){
      if(this.puzzleComplete){
        return;
      }
      var nextClue = this.findNextClue(<HTMLElement> document.getElementsByClassName("focus")[0]);
      if(nextClue != null){
        this.highlightWord(<HTMLElement> nextClue);
        this.setClueHighlightFromElem(<HTMLElement> nextClue);
      }
      else {
        this.focusAcross = !this.focusAcross;
        this.highlightWord(this.gridElems[0]);
        nextClue = this.findNextClue(<HTMLElement> document.getElementsByClassName("focus")[0]);
        if(nextClue != null){
          this.highlightWord(<HTMLElement> nextClue);
          this.setClueHighlightFromElem(<HTMLElement> nextClue);
        }
      }
    }
  }

  checkAnswers(){
    var x = -1;
    var gridLength = this.puzzle!.grid!.length ?? 0;
    for(var i = 0; i < gridLength; i++){
      for(var j = 0; j < this.puzzle!.grid![i].length; j++){
        x = x + 1;
        if(this.puzzle!.grid![i][j] == "#"){
          continue;
        }
        if(this.puzzle!.grid![i][j].replace(".","") != (<HTMLElement> this.gridElems[x].childNodes[1]).innerHTML){
          return;
        }
      }
    }
    this.puzzleComplete = true;
  }

  setTimer(time: number) {
    var timeVal = time;
    var minutes = Math.floor(timeVal / 60);
    var seconds = Math.floor(timeVal % 60);

    document.getElementById('timer')!.innerHTML = (minutes + ":" + seconds.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    }));
  }

  totalTime: number = 0;

  counter() {
    this.totalTime = this.totalTime + 0.1;

    this.setTimer(Math.floor(this.totalTime));

    this.timer = setTimeout( () => {
      this.counter();
    }, 100);
  }


}
