import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChainComponent } from './chain/chain.component';

const routes: Routes = [
  {
    path: 'chain',
    component: ChainComponent
  },
  {
    path: '',
    redirectTo: 'chain',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'chain'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
