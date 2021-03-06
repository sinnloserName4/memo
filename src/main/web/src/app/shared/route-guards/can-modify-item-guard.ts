import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {LogInService} from "../services/login.service";
import {EventService} from "../services/event.service";
import {EntryService} from "../services/entry.service";
import {UserService} from "../services/user.service";
import {Permission} from "../model/permission";
import {ShopItem} from "../model/shop-item";
import {rolePermissions} from "../model/club-role";

@Injectable()
export class CanModifyItemGuard implements CanActivate {
	constructor(private loginService: LogInService,
				private eventService: EventService,
				private entryService: EntryService,
				private userService: UserService,
				private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

		return this.loginService.currentUser()
			.flatMap(user => {
				if (user === null) {
					this.loginService.redirectUrl = state.url;
					this.router.navigate(["login"]);
					return Observable.of(false);
				}

				let id = +route.paramMap.get("id");
				let permissionKey = "";
				let shopItem = Observable.of(null);
				switch (route.paramMap.get("itemType")) {
					case "tours":
						if (id >= 0) {
							shopItem = this.eventService.getById(id);
						}
						permissionKey = "tour";
						break;
					case "partys":
						if (id >= 0) {
							shopItem = this.eventService.getById(id);
						}
						permissionKey = "party";
						break;
					case "merch":
						if (id >= 0) {
							shopItem = this.eventService.getById(id);
						}
						permissionKey = "merch";
						break;
					case "members":
						if (id >= 0) {
							shopItem = this.userService.getById(id);
						}
						permissionKey = "user";
						break;
					case "entries":
						if (id >= 0) {
							shopItem = this.entryService.getById(id);
						}
						permissionKey = "funds";
						break;
				}

				let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];

				return shopItem
					.map((item: ShopItem) => {
						//todo update once the item supports special user rights
						if (item === null) {
							return permissions[permissionKey] >= Permission.create;
						}
						return permissions[permissionKey] >= Permission.write;
					})
					.do(isAuthenticated => {
						if (!isAuthenticated) {
							this.router.navigate(["not-allowed"]);
						}
					});
			});
	}

}
