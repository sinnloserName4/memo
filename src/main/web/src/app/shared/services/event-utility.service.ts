import {Injectable} from "@angular/core";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {Event} from "../../shop/shared/model/event";
import {Tour} from "../../shop/shared/model/tour";
import {Party} from "../../shop/shared/model/party";
import {isNullOrUndefined} from "util";
import {EventType} from "../../shop/shared/model/event-type";
import {User} from "../model/user";
import {Entry} from "../model/entry";
import {ShopItemType} from "../../shop/shared/model/shop-item-type";
import {ShopItem} from "../model/shop-item";


@Injectable()
export class EventUtilityService {

	constructor() {
	}

	static getEventType(event: Event): EventType {
		return EventUtilityService.handleShopItem(event,
			merch => EventType.merch,
			tour => EventType.tours,
			party => EventType.partys,
			user => null,
			entry => null,
			error => {
				console.error(`Could not deduce type from event ${error}`);
				return null;
			});
	}

	getShopItemType(item: ShopItem | Event): ShopItemType {
		return EventUtilityService.handleShopItem(item,
			merch => ShopItemType.merch,
			tour => ShopItemType.tour,
			party => ShopItemType.party,
			user => ShopItemType.user,
			entry => ShopItemType.entry,
			error => {
				console.error(`Could not deduce type from event ${error}`);
				return null;
			});
	}

	static handleShopItem<T>(item: ShopItem | Event,
							 merchCallback: (merch: Merchandise) => T = () => null,
							 tourCallback: (tour: Tour) => T = () => null,
							 partyCallback: (party: Party) => T = () => null,
							 userCallback: (user: User) => T = () => null,
							 entryCallback: (entry: Entry) => T = () => null,
							 defaultCallback: (event: typeof item) => T = () => null): T {
		if (isNullOrUndefined(item)) {
			return defaultCallback(item);
		}
		if (EventUtilityService.isMerchandise(item)) {
			return merchCallback(item);
		}
		if (EventUtilityService.isTour(item)) {
			return tourCallback(item);
		}
		if (EventUtilityService.isParty(item)) {
			return partyCallback(item);
		}
		if (EventUtilityService.isUser(item)) {
			return userCallback(item);
		}
		if (EventUtilityService.isEntry(item)) {
			return entryCallback(item);
		}
		return defaultCallback(item);
	}

	static handleOptionalShopType<T>(type: ShopItemType, callbacks: {
		merch?: () => T,
		tours?: () => T,
		partys?: () => T,
		members?: () => T,
		entries?: () => T
	}) {
		if (!callbacks.merch) {
			callbacks.merch = () => null;
		}
		if (!callbacks.tours) {
			callbacks.tours = () => null;
		}
		if (!callbacks.partys) {
			callbacks.partys = () => null;
		}
		if (!callbacks.members) {
			callbacks.members = () => null;
		}
		if (!callbacks.entries) {
			callbacks.entries = () => null;
		}
		return EventUtilityService.handleShopType(type, callbacks.merch, callbacks.tours, callbacks.partys, callbacks.members, callbacks.entries);
	}

	static handleShopType<T>(type: ShopItemType,
							 merchCallback: () => T,
							 tourCallback: () => T,
							 partyCallback: () => T,
							 userCallback: () => T,
							 entryCallback: () => T,
							 defaultCallback: () => T = () => null): T {
		if (isNullOrUndefined(type)) {
			return defaultCallback();
		}
		switch (type) {
			case ShopItemType.party:
				return partyCallback();
			case ShopItemType.tour:
				return tourCallback();
			case ShopItemType.merch:
				return merchCallback();
			case ShopItemType.user:
				return userCallback();
			case ShopItemType.entry:
				return entryCallback();
		}
		return defaultCallback();
	}

	static isUser(event: any): event is User {
		return event && (<User>event).email !== undefined;
	}

	static isEntry(event: any): event is Entry {
		return event && (<Entry>event).category !== undefined;
	}


	static isMerchandise(event: any): event is Merchandise {
		return event && (<Merchandise>event).colors !== undefined;
	}

	static isTour(event: any): event is Tour {
		return event && (<Tour>event).vehicle !== undefined
	}

	static isParty(event: any): event is Party {
		return event && (<Party>event).emptySeats !== undefined && (<Tour>event).vehicle === undefined;
	}
}
