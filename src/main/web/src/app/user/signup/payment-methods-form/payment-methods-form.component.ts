import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {PaymentInfo} from "./debit-input-form/payment-info";
import {SignUpSubmitEvent} from "../signup-submit-event";
import {SignUpSection} from "../signup-section";

@Component({
	selector: "memo-payment-methods-form",
	templateUrl: "./payment-methods-form.component.html",
	styleUrls: ["./payment-methods-form.component.scss"]
})
export class PaymentMethodsFormComponent implements OnInit {
	@Input() user: any;
	@Input() loading: boolean = false;
	paymentMethod: { value: string, name: string };
	paymentMethods = [
		{
			value: "debit",
			name: "Lastschrift"
		},
		{
			value: "other",
			name: "Sonstiges"
		}];

	debitFormIsValid = false;
	debitInfo: PaymentInfo;

	@Output() onSubmit = new EventEmitter<SignUpSubmitEvent>();

	constructor() {
	}

	ngOnInit() {
	}


	saveDebitInfo({formIsValid, paymentInfo}) {
		this.debitFormIsValid = formIsValid;
		this.debitInfo = paymentInfo;
	}

	submit() {
		this.onSubmit.emit({
			section: SignUpSection.PaymentMethods,
			paymentInfo: this.debitFormIsValid ? this.debitInfo : undefined
		})
	}
}
