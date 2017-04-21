import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {LogInService} from "../services/login.service";
import {ClubRole, isAuthenticated} from "../model/club-role";

@Injectable()
export class IsOrganizerGuard implements CanActivate {
	constructor(private loginService: LogInService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

		return this.loginService.currentUser()
			.map(user => {
				if (user === null) {
					this.loginService.redirectUrl = state.url;
					this.router.navigate(["login"]);
					return false;
				}
				if (isAuthenticated(user.clubRole, ClubRole.Organizer)) {
					return true;
				}
				this.router.navigate(["not-allowed"]);
				return false;
			});
	}

}
