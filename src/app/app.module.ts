import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PuzzleComponent } from './puzzle/puzzle.component';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

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
    //FireModule.initializeApp(environment.firebaseConfig),
    //FirestoreModule
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore())
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {}
