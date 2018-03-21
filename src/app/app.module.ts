import { ErrorComponent } from './error/error.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { SteemService } from './steem.service';

const appRoutes: Routes = [
    { path: ':username', component: ProfileComponent},
    { path: '', component: ErrorComponent}
];

@NgModule({
    declarations: [
        AppComponent,
        ProfileComponent,
        ErrorComponent
    ],
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        HttpClientModule
    ],
    providers: [
        SteemService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
