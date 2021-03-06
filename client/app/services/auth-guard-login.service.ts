import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class AuthGuardLogin implements CanActivate {

    constructor(public auth: AuthService, private router: Router, private route: ActivatedRoute) { }

    canActivate() {
        if (this.auth.loggedIn) {
            this.router.navigate(['/home/admin']);
        }
        return !this.auth.loggedIn;
    }

}
