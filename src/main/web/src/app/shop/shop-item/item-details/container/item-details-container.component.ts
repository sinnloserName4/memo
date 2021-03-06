import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {MdDialog} from "@angular/material";
import {ItemImagePopupComponent} from "./image-popup/item-image-popup.component";
import {Event} from "../../../shared/model/event";
import {EventOverviewKey} from "./overview/event-overview-key";
import {LogInService} from "../../../../shared/services/login.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {rolePermissions} from "../../../../shared/model/club-role";
import {Permission} from "../../../../shared/model/permission";


@Component({
	selector: "memo-item-details-container",
	templateUrl: "./item-details-container.component.html",
	styleUrls: ["./item-details-container.component.scss"]
})
export class ItemDetailsContainerComponent implements OnInit {
	@Input() event: Event;
	@Input() overviewKeys: Observable<EventOverviewKey[]> = Observable.of([]);

	userCanEditEvent: Observable<boolean> = this.loginService.currentUser()
		.map((user) => {
			if (user !== null && event !== null) {
				let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];
				let permissionKey = EventUtilityService.handleShopItem(this.event,
					merch => "merch",
					tour => "tour",
					party => "party"
				);
				if (permissionKey) {
					return permissions[permissionKey] >= Permission.write;
				}
			}

			return false;
		});

	constructor(private mdDialog: MdDialog,
				private loginService: LogInService) {
	}

	ngOnInit() {
	}

	showDetailedImage(imagePath: string) {
		this.mdDialog.open(ItemImagePopupComponent, {
			data: {
				imagePath: imagePath
			}
		})
	}
}
