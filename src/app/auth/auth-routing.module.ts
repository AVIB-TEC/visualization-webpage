import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

onst routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    /*children: [
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'login',
        component: LoginComponent
      }
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: '**',
        component: LoginComponent
      }
    ]*/
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
