import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PuzzleComponent } from './puzzle/puzzle.component';

import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { CreateComponent } from './create/create.component';

@NgModule({
  declarations: [
    AppComponent,
    PuzzleComponent,
    CreateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {}
