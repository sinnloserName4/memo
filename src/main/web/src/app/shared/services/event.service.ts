import {Injectable} from "@angular/core";
import {EventType, getEventTypes} from "../../shop/shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {Event} from "../../shop/shared/model/event";
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response, ResponseOptions} from "@angular/http";
import {EventUtilityService} from "./event-utility.service";
import {EventFactoryService} from "./event-factory.service";
import {Tour} from "../../shop/shared/model/tour";
import {Party} from "../../shop/shared/model/party";
import {CacheStore} from "../stores/cache.store";
import {ParticipantsService} from "./participants.service";
import {ServletService} from "./servlet.service";
import {Merchandise} from "app/shop/shared/model/merchandise";

@Injectable()
export class EventService extends ServletService<Event> {
	constructor(private http: Http,
				private cache: CacheStore,
				private participantsService: ParticipantsService,
				private eventUtilService: EventUtilityService,
				private eventFactoryService: EventFactoryService) {
		super();
	}

	private readonly baseUrl = `/api/event`;

	/**
	 * Helper method for accessing the cache
	 * @param eventType
	 */
	private static cacheKeyFromEventType(eventType: EventType): "tours" | "partys" | "merch" {
		switch (eventType) {
			case EventType.tours:
				return "tours";
			case EventType.partys:
				return "partys";
			case EventType.merch:
				return "merch";
		}
		return "tours";
	}


	/**
	 * Requested das Event (mit einem bestimmten Event-Typen) vom Server, welches die gegebene ID besitzt
	 * @param eventId
	 * @param eventType
	 * @param refresh
	 * @returns {Observable<T>}
	 */
	getById(eventId: number, refresh?: boolean): Observable<Event> {
		let url = `${this.baseUrl}?id=${eventId}`;

		//return cached version if available to reduce number of http request necessary
		//todo test: maybe just switch to rxjs solution instead
		let cachedEvent = this.cache.getEventById(eventId);
		if (cachedEvent && !refresh) {
			return Observable.of(cachedEvent);
		}

		//todo remove when backend is running todo demo
		if (!refresh) {
			return Observable.combineLatest(
				this.search("", EventType.merch),
				this.search("", EventType.partys),
				this.search("", EventType.tours)
			).map(([merch, partys, tours]: [Merchandise[], Party[], Tour[]]) => {
				return [...merch, ...partys, ...tours]
					.find(event => event.id === eventId);
			})
		}

		return this.performRequest(this.http.get(url))
			.map(response => response.json().events)
			.map(json => Event.create().setProperties(json[0]))
			.do(event => this.cache.addOrModify(event));
	}

	/**
	 *
	 * @param userId
	 * @param eventTypes
	 */
	getEventsOfUser(userId: number, eventTypes: { tours?: boolean, partys?: boolean }): Observable<(Tour | Party)[]> {
		let searchQueries: Observable<Event[]>[] = getEventTypes()
			.filter(type => eventTypes[type])
			.map(eventType => {
				let params = new URLSearchParams();
				params.set("userId", userId.toString());
				params.set("type", eventType.toString());

				//todo remove demo
				if (eventType) {
					return this.search("", eventType)
						.flatMap(results => Observable.combineLatest(...results.map(result =>
							this.participantsService.getParticipantIdsByEvent(result.id, eventType)
								.map(participantIds => ({
									result,
									participantIds
								}))))
							.map(resultWithParticipants => resultWithParticipants
								.filter(result => result.participantIds.find(participant => participant.id === userId))
								.map(result => result.result))
						)
				}

				return this.performRequest(this.http.get("/api/event", {search: params}))
					.map(response => response.json().events as (Party | Tour)[]);
			});

		return Observable.combineLatest(searchQueries)
		//combine two observable arrays (one for tours, one for partys) into one
			.map((nestedEventArray: (Tour | Party)[][]) =>
				nestedEventArray.reduce((previous, current) => previous.concat(...current), []));
	}

	/**
	 * Requested alle Events (mit dem gegebenen event typen), die auf den search term matchen
	 * @param searchTerm
	 * @param eventType
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, eventType: EventType): Observable<Event[]> {
		//if no event type is specified, search for all kinds of events (the default value is 'ALL')
		let url = `${this.baseUrl}?searchTerm=${searchTerm}` + ((eventType !== null) ? `&type=${eventType}` : "");

		//todo remove when backend is running todo demo
		url = `/resources/mock-data/${eventType}.json`;

		const httpRequest = this.performRequest(this.http.get(url))
			.map(response => response.json().events)
			.map((jsonArray: any[]) => jsonArray.map(json => this.eventFactoryService.build(eventType).setProperties(json)))
			.do(events => this.cache.addMultiple(...events));

		//todo remove when backend is running todo demo
		const DEBUG_httpRequest = httpRequest.map(events => events.filter(event => event.matchesSearchTerm(searchTerm)));
		// let DEBUG_httpRequest = httpRequest;

		const cachedObservable: Observable<Event[]> = this.cache.search(searchTerm, EventService.cacheKeyFromEventType(eventType));

		//if any of the cached events match the search term, combine these with the ones loaded from the server
		return Observable.combineLatest(cachedObservable, DEBUG_httpRequest,
			(cachedEvents, loadedEvents) => [...cachedEvents, ...loadedEvents]
				.filter((value, index, array) =>
						//removes duplicate entries
					array.findIndex((event: Event) => event.id === value.id && event.title === value.title) === index
				));
	}


	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param event
	 * @returns {Observable<T>}
	 */
	addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
				event: Event): Observable<Event> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.performRequest(requestMethod(this.baseUrl, {event}, requestOptions))
			.map(response => response.json().id)
			.flatMap(id => this.getById(id));
	}

	/**
	 * Sendet ein Event Objekt an den Server, welcher dieses zur Datenbank hinzufügen soll. Der Server
	 * gibt dann das erstellte Objekt wieder an den Client zurück
	 * @param event
	 * @returns {Observable<T>}
	 */
	add(event: Event): Observable<Event> {
		//todo if merch => update stockService
		return this.addOrModify(this.http.post.bind(this.http), event);
	}

	/**
	 * Sendet ein Event Objekt an den Server, welcher dieses mit den übergebeben Daten updaten soll. Der Server
	 * gibt dann das geupdatete Objekt wieder an den Client zurück
	 * @param event
	 * @returns {Observable<T>}
	 */
	modify(event: Event): Observable<Event> {
		//todo if merch => update stockService
		return this.addOrModify(this.http.put.bind(this.http), event);
	}


	/**
	 * Löscht das Event mit der gegebenen ID aus der Datenbank
	 * @param eventId
	 * @returns {Observable<T>}
	 */
	remove(eventId: number): Observable<Response> {
		//todo remove demo
		if (eventId >= 0) {
			return Observable.of(new Response(new ResponseOptions()));
		}

		return this.performRequest(this.http.delete(this.baseUrl, {body: {id: eventId}}))
			.do((removeResponse: Response) => {
				const eventId: number = removeResponse.json().id;
				this.cache.remove(EventService.cacheKeyFromEventType(EventType.merch), eventId);
			});
	}


}
