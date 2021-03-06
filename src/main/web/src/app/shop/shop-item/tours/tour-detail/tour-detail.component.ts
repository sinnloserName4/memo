import {Component, OnInit} from "@angular/core";
import {Tour} from "../../../shared/model/tour";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/event.service";
import {EventType} from "../../../shared/model/event-type";
import {ParticipantsService} from "../../../../shared/services/participants.service";
import {AddressService} from "../../../../shared/services/address.service";
import {LogInService} from "../../../../shared/services/login.service";
import {Permission} from "../../../../shared/model/permission";
import {rolePermissions} from "../../../../shared/model/club-role";
import {CommentService} from "../../../../shared/services/comment.service";
import {Comment} from "../../../shared/model/comment";
import {BehaviorSubject} from "rxjs/BehaviorSubject";


@Component({
	selector: "memo-tour-details",
	templateUrl: "./tour-detail.component.html",
	styleUrls: ["./tour-detail.component.scss"]
})
export class TourDetailComponent implements OnInit {
	tour$: Observable<Tour> = this.activatedRoute.params
		.flatMap(params => this.eventService.getById(+params["id"]));

	overViewKeys$: Observable<EventOverviewKey[]> = this.tour$.map(tour => tour.overviewKeys);

	tourRoute$ = this.tour$
		.flatMap(tour => Observable.combineLatest(tour.route.map(addressId => this.addressService.getById(addressId))));

	participants$ = this.tour$
		.flatMap((tour: Tour) => this.participantService.getParticipantUsersByEvent(tour.id, EventType.tours));

	participantsLink$ = Observable.combineLatest(this.tour$, this.loginService.currentUser())
		.map(([tour, user]) => {
			if (user !== null) {
				let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];
				return permissions.tour >= Permission.write
					? "/tours/" + tour.id + "/participants"
					: null
			}
			return null;
		});

	comments$ = this.tour$
		.filter(tour => tour.id >= 0)
		.flatMap(tour => this.commentService.getByEventId(tour.id));

	commentsSubject$ = new BehaviorSubject<Comment[]>([]);

	constructor(private activatedRoute: ActivatedRoute,
				private participantService: ParticipantsService,
				private loginService: LogInService,
				private commentService: CommentService,
				private addressService: AddressService,
				private eventService: EventService) {
		this.comments$.subscribe(comments => this.commentsSubject$.next(comments));
	}

	ngOnInit() {
	}


	/**
	 *
	 * @param commentText
	 * @param parentId
	 */
	addComment({commentText, parentId}){
		Observable.combineLatest(this.loginService.currentUser(), this.tour$)
			.subscribe(([user, tour]) => {
				let comment = new Comment(tour.id, -1, new Date(), user.id, commentText);
				this.commentService.add(comment, parentId)
					.subscribe((addResult: Comment) => {
						this.tour$
							.filter(tour => tour.id >= 0)
							.flatMap(tour => this.commentService.getByEventId(tour.id))
							.first()
							.subscribe(comments => {
								this.commentsSubject$.next(comments);
							})
					}, error => {
						console.error("adding the comment went wrong");
					});
			})
	}

	/**
	 *
	 * @param {Comment} comment
	 * @param {number} parentId
	 */
	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.subscribe(response => {
				this.tour$
					.filter(tour => tour.id >= 0)
					.flatMap(tour => this.commentService.getByEventId(tour.id))
					.first()
					.subscribe(comments => {
						this.commentsSubject$.next(comments);
					})
			})
	}
}
