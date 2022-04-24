import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { CrosswordsComponent } from './crosswords/crosswords.component';
import { PuzzleComponent } from './puzzle/puzzle.component';
import { CreateComponent } from './create/create.component';

const routes: Routes = [
  //{ path: 'crosswords', component: CrosswordsComponent },
  { path: 'puzzle/:id', component: PuzzleComponent },
  { path: 'create', component: CreateComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
