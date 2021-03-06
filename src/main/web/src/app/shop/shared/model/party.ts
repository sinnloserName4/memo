import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {EventOverviewKey} from "../../shop-item/item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";

export class Party extends Event {

	constructor(id: number,
				title: string,
				date: Date,
				description: string,
				expectedRole: ClubRole,
				route: EventRoute,
				imagePath: string,
				capacity: number,
				priceMember: number,
				public emptySeats: number) {
		super(id, title, date, description, expectedRole, route, imagePath, capacity, priceMember);
	}


	static create() {
		return new Party(-1, "", new Date(1999, 9, 19), "", ClubRole.None, [], "", -1, -1, -1);
	}

	get overviewKeys(): EventOverviewKey[] {
		return [
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			},
			{
				key: "date",
				label: "Datum",
				pipe: "date"
			},
			{
				key: "emptySeats",
				label: "Freie Plätze"
			},
			//todo besseres label oder komplett weg?
			// {
			// 	key: "expectedRole",
			// 	label: "Für"
			// },
		];
	}

	get detailsTableKeys(): EventOverviewKey[] {
		return [
			{
				key: "date",
				label: "Datum",
				pipe: "date"
			},
			{
				key: "capacity",
				label: "Maximale Teilnehmeranzahl"
			},
			{
				key: "emptySeats",
				label: "Freie Plätze"
			},
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			}
		]
	}
}
