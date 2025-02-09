import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
		// 引入 google maps module
    GoogleMapsModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
