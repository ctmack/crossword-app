import { Component, HostListener, ViewEncapsulation, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { AppRoutingModule } from './../app-routing.module'
import { Puzzle } from '../puzzle';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { PuzzleService } from '../puzzle.service';
import { RespWord } from '../resp-word';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CreateComponent implements OnInit, AfterViewInit {

  count: number = 0;
  paused: boolean = false;
  gridElems: HTMLElement[] = [];
  focusAcross: boolean = true;
  puzzleComplete: boolean = false;
  puzzleGridString: String = "";
  constructMode: String = ""; // build, fill
  mirrorMode: String = ""; // free*, x-axis*, y-axis*, xy-axis*, rotational*, diagonal*
  puzzleWidth: number = 15;
  puzzleHeight: number = 15;

  constructor() {
  }

  ngOnInit(): void {
    document.getElementById("nav-table")!.style.display="none";
    document.getElementById("create-button")!.style.display="none";
    for(var i = 0; i < this.puzzleWidth; i++){
      for(var j = 0; j < this.puzzleHeight; j++){
        this.puzzleGridString = this.puzzleGridString + ".";
      }
    }
  }

  ngOnDestroy(): void {
    document.getElementById("nav-table")!.style.display="block";
    document.getElementById("create-button")!.style.display="block";
    (<HTMLElement> document.getElementById("headline-sub-title")).innerHTML = "";
  }

  ngAfterViewInit(): void {
    (<HTMLElement> document.getElementById("headline-sub-title")).innerHTML = "|<span style=\"margin-left:20px\">Create Puzzle</span>";
    this.buttonSetup();
    this.buildTable();
  }

  buttonSetup(){
    for(var i = 0; i < document.getElementsByClassName("mirror-type").length; i++){
      document.getElementsByClassName("mirror-type")[i].addEventListener("click", (event) => {
        var targetElem = <HTMLElement> event.target;
        if(targetElem!.classList.contains("mirror-name") || targetElem!.classList.contains("mirror-img")){
          targetElem = <HTMLElement> targetElem!.parentElement;
        }
        this.mirrorMode = (<HTMLElement> targetElem.childNodes[0]).innerHTML.toLowerCase();
        this.clearMirrorSelect();
        targetElem.classList.add("selected");
      })
    }

    document.getElementById("construct-fill-button")!.addEventListener("click", (event) => {
      var targetElem = <HTMLElement> event.target;
      document.getElementById("build-section")!.classList.add("hidden");
      document.getElementById("fill-section")!.classList.remove("hidden");
      this.clearConstructSelect();
      targetElem.classList.add("selected");
      this.constructMode = "fill";
      this.findFirstOpen();
      this.setFillWords();
    });
    document.getElementById("construct-build-button")!.addEventListener("click", (event) => {
      document.getElementById("build-section")!.classList.remove("hidden");
      document.getElementById("fill-section")!.classList.add("hidden");
      var targetElem = <HTMLElement> event.target;
      this.mirrorMode = targetElem.innerHTML.toLowerCase();
      this.clearMirrorSelect();
      this.clearConstructSelect();
      document.getElementsByClassName("mirror-type")[0].classList.add("selected");
      targetElem.classList.add("selected");
      this.constructMode = "build";
      this.buildTable();
    })

    this.constructMode = document.getElementById("construct-fill-button")!.innerHTML.toLowerCase();
    document.getElementById("construct-fill-button")!.classList.add("selected");
    if(this.constructMode != "fill"){
      document.getElementsByClassName("mirror-type")[0].classList.add("selected");
      this.mirrorMode = document.getElementsByClassName("mirror-type")[0].innerHTML.toLowerCase();
    }

    document.getElementById('clear-letters-button')!.addEventListener("click", (event) => {
      this.clearLetters();
    })
    document.getElementById('clear-all-button')!.addEventListener("click", (event) => {
      this.clearAll();
    })

    document.getElementById('preset-15')!.addEventListener("click", (event) => {
      this.puzzleWidth = 15;
      this.puzzleHeight = 15;
      this.clearAll();
    })
    document.getElementById('preset-21')!.addEventListener("click", (event) => {
      this.puzzleWidth = 21;
      this.puzzleHeight = 21;
      this.clearAll();
    })
    document.getElementById('preset-5')!.addEventListener("click", (event) => {
      this.puzzleWidth = 5;
      this.puzzleHeight = 5;
      this.clearAll();
    })
    document.getElementById('preset-6')!.addEventListener("click", (event) => {
      this.puzzleWidth = 6;
      this.puzzleHeight = 6;
      this.clearAll();
    })
    document.getElementById('preset-8')!.addEventListener("click", (event) => {
      this.puzzleWidth = 8;
      this.puzzleHeight = 8;
      this.clearAll();
    })
  }

  setFillWords(){
    var segment = "";
    for(var x = 0; x < this.puzzleGridString.length; x++){
      if(this.gridElems[x].classList.contains("focus") || this.gridElems[x].classList.contains("focus-word")){
        if(this.puzzleGridString[x] == "."){
          segment = segment + "?";
        }
        else{
          segment = segment + this.puzzleGridString[x];
        }
      }
    }
    console.log(segment);
    const listDOM = document.getElementById('word-list');
    while (listDOM!.firstChild) {
      listDOM!.removeChild(listDOM!.firstChild);
    }
    this.getWords(segment).then(words => {
      var wordL : string[] = words.map(u => u.word.toString());
      var x = 0;
      var count = 0;
      while(x < wordL.length && count < 20){
        var wordString = (<String> wordL[x]).toUpperCase()
        if(/^[a-zA-Z]+$/.test(wordString)){
          var wordDOM = document.createElement('div');
          wordDOM!.innerHTML = wordString;
          wordDOM.classList.add("fill-word");
          wordDOM.addEventListener("click", (event) => {
            var targetElem = <HTMLElement> event.target;
            var wordIndex = 0;
            for(var i = 0; i < this.gridElems.length; i++){
              if(this.gridElems[i].classList.contains("focus") || this.gridElems[i].classList.contains("focus-word")){
                (<HTMLElement> this.gridElems[i].childNodes[1]).innerHTML = targetElem.innerHTML[wordIndex];
                wordIndex = wordIndex + 1;
                if(wordIndex >= targetElem.innerHTML.length){break;}
              }
            }

            var nextClue = this.findNextClue(<HTMLElement> document.getElementsByClassName("focus")[0]);
            if(nextClue == null){
              return;
            }
            this.highlightWord(<HTMLElement> nextClue);
            this.populateUserGridString();
            this.setFillWords();

          })
          listDOM!.append(wordDOM);
          count = count + 1;
        }
        x = x + 1;
      }
    });
  }


  getWords(segment: String): Promise<RespWord[]> {
    return fetch('https://api.datamuse.com/words?sp=' + segment).then(res => res.json()).then(res => {return res as RespWord[]});
  }

  highlightWordAndSetFillWords(elem: HTMLElement) {
    this.highlightWord(elem);
    this.setFillWords();
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

  clearAll(){
    this.puzzleGridString = "";
    for(var i = 0; i < this.puzzleWidth; i++){
      for(var j = 0; j < this.puzzleHeight; j++){
        this.puzzleGridString = this.puzzleGridString + ".";
      }
    }
    this.buildTable();
  }

  clearLetters(){
    var newGridString = "";
    for(var i = 0; i < this.puzzleGridString.length; i++){
      if(this.puzzleGridString[i] == "#"){
        newGridString = newGridString + "#";
      }
      else {
        newGridString = newGridString + ".";
      }
    }
    this.puzzleGridString = newGridString;
    this.buildTable();
    this.findFirstOpen();
  }

  clearMirrorSelect(){
    for(var i = 0; i < document.getElementsByClassName("mirror-type").length; i++){
      document.getElementsByClassName("mirror-type")[i].classList.remove("selected");
    }
  }

  clearConstructSelect(){
    for(var i = 0; i < document.getElementsByClassName("construct-type").length; i++){
      document.getElementsByClassName("construct-type")[i].classList.remove("selected");
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

  clearTable() {
    this.gridElems = [];
    var tableDOM: HTMLElement | null = document.getElementById('crossword-table');
    while (tableDOM!.firstChild) {
        tableDOM!.removeChild(tableDOM!.firstChild);
    }
  }

  buildTable(){
    this.clearTable();
    var tableDOM: HTMLElement | null = document.getElementById('crossword-table');
    var acrossCount: number = 0;
    var downCount: number = 0;
    var clueCount: number = 0;

    var rowCount: number = this.puzzleHeight ?? 0;
    var index = -1;
    for(var i = 0; i < rowCount; i++){
      var rowDOM = document.createElement('tr');
      var columnCount: number = this.puzzleWidth ?? 0;
      for(var j = 0; j < columnCount; j++){
        index++;
        var squareDOM = document.createElement('th');
        var numberLabel: number = 0;
        var acrossVal: number = 0;
        var downVal: number = 0;

        if(this.puzzleGridString[index] == "#"){
          squareDOM.classList.add("inactive");
          this.gridElems.push(squareDOM);
          squareDOM.addEventListener("click", (event) => {
            var targetElem = <HTMLElement> event.target;
            if(this.constructMode == "build"){
              this.mirrorSelection(targetElem);
              this.populateUserGridString();
              this.buildTable();
              return;
            }
          })
          rowDOM.appendChild(squareDOM);
          continue;
        }

        if((j == 0 || this.puzzleGridString[index-1] == "#") && (i == 0 || this.puzzleGridString[index-columnCount] == "#")){
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
          if(j == 0 || this.puzzleGridString[index-1] == "#"){
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
          else if(i == 0 || this.puzzleGridString[index-columnCount] == "#"){
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
          var targetElem = <HTMLElement> event.target;
          if(targetElem!.classList.contains("number-label") || targetElem!.classList.contains("grid-letter")){
            targetElem = <HTMLElement> targetElem!.parentElement;
          }
          if(this.constructMode == "build"){
            this.mirrorSelection(targetElem);
            //targetElem!.classList.add("inactive");
            //(<HTMLElement> targetElem.childNodes[1]).innerHTML = "#"; //might not want to it have this as the inner html when you can just change it on the grid string and have it not appear and may later be easier to get rid of
            this.populateUserGridString();
            this.buildTable();
            return;
          }

          if(targetElem.classList.contains("focus")){
            this.focusAcross = !this.focusAcross;
          }
          this.highlightWord(targetElem);
          this.setFillWords();
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
        if(this.puzzleGridString[index] != "." && this.puzzleGridString[index] != ","){
          (<HTMLElement> squareDOM.childNodes[1]).innerHTML = this.puzzleGridString[index];
        }

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

    var gridBoxHeight = (550 - ((rowCount*4) - 2)) / rowCount;
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

    if(this.constructMode == "fill"){
      this.highlightWord(this.gridElems[0]);
    }
    this.setFillWords();

  }

  findFirstOpen(){
    if(this.focusAcross){
      var x = 0;
      while(x < this.gridElems.length && (this.gridElems[x].classList.contains("inactive") || (<HTMLElement> this.gridElems[x].childNodes[1]).innerHTML != "")){
        x = x + 1;
      }
      if(x < this.gridElems!.length){
        this.highlightWord(this.gridElems[x]);
      }
    }
    else{
      var x = 0;
      while(x < this.gridElems.length && (this.gridElems[x].classList.contains("inactive") || (<HTMLElement> this.gridElems[x].childNodes[1]).innerHTML != "")){
        x = x + this.puzzleWidth!;
      }
      if(x < this.gridElems!.length){
        this.highlightWord(this.gridElems[x]);
      }
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
      x = x + this.puzzleWidth!;
      while(x < this.gridElems.length && this.gridElems[x].classList.contains("inactive")){
        x = x + this.puzzleWidth!;
      }
      if(x < this.gridElems!.length){
        this.highlightWord(this.gridElems[x]);
      }
    }
  }

  mirrorSelection(elem: HTMLElement){
    var elementIndex = -1;
    for(var i = 0; i < this.gridElems.length; i++){
      if(this.gridElems[i] == elem){
        elementIndex = i;
      }
    }
    this.switchInactive(this.gridElems[elementIndex]);
    if(this.mirrorMode == "x-axis"){
      if(((this.puzzleHeight-1) - Math.floor(elementIndex / this.puzzleWidth)) == Math.floor(this.puzzleHeight / 2)){
        return;
      }
      var mirrorIndex = (elementIndex % this.puzzleWidth) + (((this.puzzleHeight-1) - Math.floor(elementIndex / this.puzzleWidth))*this.puzzleWidth);
      this.switchInactive(this.gridElems[mirrorIndex]);
    }
    else if(this.mirrorMode == "y-axis"){
      if((elementIndex % this.puzzleWidth) == (Math.floor(this.puzzleWidth / 2))){
        return;
      }
      var mirrorIndex = ((this.puzzleWidth-1) - (elementIndex % this.puzzleWidth)) + (Math.floor(elementIndex / this.puzzleHeight) * this.puzzleHeight);
      this.switchInactive(this.gridElems[mirrorIndex]);
    }
    else if(this.mirrorMode == "xy-axis"){
      var ymirror = -1;
      if((elementIndex % this.puzzleWidth) != (Math.floor(this.puzzleWidth / 2))){
        var mirrorIndex = ((this.puzzleWidth-1) - (elementIndex % this.puzzleWidth)) + (Math.floor(elementIndex / this.puzzleHeight) * this.puzzleHeight);
        this.switchInactive(this.gridElems[mirrorIndex]);
        ymirror = mirrorIndex;
      }
      if(((this.puzzleHeight-1) - Math.floor(elementIndex / this.puzzleWidth)) != Math.floor(this.puzzleHeight / 2)){
        var mirrorIndex = (elementIndex % this.puzzleWidth) + (((this.puzzleHeight-1) - Math.floor(elementIndex / this.puzzleWidth))*this.puzzleWidth);
        this.switchInactive(this.gridElems[mirrorIndex]);
      }
      if(((this.puzzleHeight-1) - Math.floor(ymirror / this.puzzleWidth)) != Math.floor(this.puzzleHeight / 2) && ymirror != -1){
        //console.log(ymirror);
        var ymirrorIndex = (ymirror % this.puzzleWidth) + (((this.puzzleHeight-1) - Math.floor(ymirror / this.puzzleWidth))*this.puzzleWidth);
        //console.log(ymirrorIndex);
        this.switchInactive(this.gridElems[ymirrorIndex]);
      }
    }
    else if(this.mirrorMode == "rotational"){
      if(elementIndex == ((this.puzzleWidth * this.puzzleHeight)-1)/2){
        return;
      }
      var q1x = Math.floor(elementIndex / this.puzzleHeight);
      var q1y = (elementIndex % this.puzzleHeight);
      var q1Index = (this.puzzleWidth * (q1x)) + (q1y);
      var q2Index = (this.puzzleWidth * (q1y)) + (this.puzzleHeight - 1 - q1x);
      var q3Index = (this.puzzleWidth * (this.puzzleWidth - 1 - q1x)) + (this.puzzleHeight - 1 - q1y);
      var q4Index = (this.puzzleWidth * (this.puzzleWidth - 1 - q1y)) + (q1x);
      this.switchInactive(this.gridElems[q2Index]);
      this.switchInactive(this.gridElems[q3Index]);
      this.switchInactive(this.gridElems[q4Index]);
    }
    else if(this.mirrorMode == "diagonal"){
      if(elementIndex == ((this.puzzleWidth * this.puzzleHeight)-1)/2){
        return;
      }
      var primaryX = Math.floor(elementIndex / this.puzzleHeight);
      var primaryY = (elementIndex % this.puzzleHeight);
      var primaryIndex = (this.puzzleWidth * (primaryX)) + (primaryY);
      var diagonalIndex = (this.puzzleWidth * (this.puzzleWidth - 1 - primaryX)) + (this.puzzleHeight - 1 - primaryY);
      this.switchInactive(this.gridElems[diagonalIndex]);
    }
  }

  switchInactive(elem: HTMLElement){
    if(elem!.classList.contains("inactive")){
      elem!.classList.remove("inactive");
    }
    else{
      elem!.classList.add("inactive");
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

  populateUserGridString(){
    this.puzzleGridString = "";
    for(var i = 0; i < this.gridElems.length; i++){
      if(this.gridElems[i].classList.contains("inactive")){
        this.puzzleGridString = this.puzzleGridString + "#";
      }
      else if(this.gridElems[i].hasChildNodes()){
        if((<HTMLElement> this.gridElems[i].childNodes[1]).innerHTML != ""){
          this.puzzleGridString = this.puzzleGridString + (<HTMLElement> this.gridElems[i].childNodes[1]).innerHTML;
        }
        else {
          this.puzzleGridString = this.puzzleGridString + ".";
        }
      }
      else {
        this.puzzleGridString = this.puzzleGridString + ".";
      }
    }
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
    }
    else{
      this.focusAcross = !this.focusAcross;
      this.highlightWord(<HTMLElement> document.getElementsByClassName("focus")[0]);
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
      x = x - this.puzzleWidth!;
      while(x > 0 && this.gridElems[x].classList.contains("inactive")){
        x = x - this.puzzleWidth!;
      }
      if(x >= 0 && !this.gridElems[x].classList.contains("inactive")){
        lastValid = x;
      }
      this.highlightWord(<HTMLElement> this.gridElems[lastValid]);
    }
    else{
      this.focusAcross = !this.focusAcross; 
      this.highlightWord(<HTMLElement> document.getElementsByClassName("focus")![0]);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(this.constructMode == "build"){
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
          return;
        }
        this.highlightWord(<HTMLElement> nextClue);
      }
      else{
        this.highlightWord(<HTMLElement> nextSpace);
      }
      this.populateUserGridString();
      this.setFillWords();
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
      this.populateUserGridString();
      this.setFillWords();
    }
    //Down
    if(event.keyCode == 40){
      if(!this.focusAcross){
        var x = 0;
        while(x < gridLength && !this.gridElems[x].classList.contains("focus")){
          x = x + 1;
        }
        x = x + this.puzzleWidth!;
        while(x < gridLength && this.gridElems[x].classList.contains("inactive")){
          x = x + this.puzzleWidth!;
        }
        if(x < gridLength){
          this.highlightWord(<HTMLElement> this.gridElems[x]);
          this.setFillWords();
        }
      }
      else{
        this.focusAcross = !this.focusAcross;
        this.highlightWord(<HTMLElement> document.getElementsByClassName("focus")[0]);
        this.setFillWords();
      }
    }
    //Up
    if(event.keyCode == 38){
      this.goUp();
      this.setFillWords();
    }
    //Left
    if(event.keyCode == 37){
      this.goLeft();
      this.setFillWords();
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
          this.setFillWords();
        }
      }
      else{
        this.focusAcross = !this.focusAcross;
        this.highlightWord(<HTMLElement> document.getElementsByClassName("focus")[0]);
        this.setFillWords();
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
        this.setFillWords();
      }
      else {
        this.focusAcross = !this.focusAcross;
        this.highlightWord(this.gridElems[0]);
        this.setFillWords();
        nextClue = this.findNextClue(<HTMLElement> document.getElementsByClassName("focus")[0]);
        if(nextClue != null){
          this.highlightWord(<HTMLElement> nextClue);
          this.setFillWords();
        }
      }
    }
  }

  checkStandards(){
    var highestAcross = -1;
    var highestDown = -1;

    for(var i = 0; i < this.gridElems.length; i++){
      var acrossNum = this.getAcrossFromElem(this.gridElems[i]);
      if(acrossNum > highestAcross){
        highestAcross = acrossNum;
      }
      var downNum = this.getDownFromElem(this.gridElems[i]);
      if(downNum > highestDown){
        highestDown = downNum;
      }
    }

    var acrossWordsLengths: number[] = new Array(highestAcross);
    var downWordsLengths: number[] = new Array(highestDown);

    for(var i = 0; i < this.gridElems.length; i++){
      var acrossNum = this.getAcrossFromElem(this.gridElems[i]);
      if(acrossWordsLengths[acrossNum] == undefined){
        acrossWordsLengths[acrossNum] = 0;
      }
      else{
        acrossWordsLengths[acrossNum] = acrossWordsLengths[acrossNum] + 1;
      }
      var downNum = this.getDownFromElem(this.gridElems[i]);
      if(downWordsLengths[downNum] == undefined){
        downWordsLengths[downNum] = 0;
      }
      else{
        downWordsLengths[downNum] = downWordsLengths[downNum] + 1;
      }
    }

    for(var i = 0; i < acrossWordsLengths.length; i++){
      
    }

  }



}
