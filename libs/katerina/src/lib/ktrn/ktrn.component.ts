import { Component } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';

@Component({
  selector: 'isolatedm-ktrn',
  templateUrl: './ktrn.component.html',
  styleUrls: ['./ktrn.component.css'],
})
export class KtrnComponent {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private routeSnap: ActivatedRouteSnapshot
  ) {}
}
