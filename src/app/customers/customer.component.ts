import { Component, OnInit } from '@angular/core';
import { Customer } from './customer';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';



function ratingValidator(minNumber: Number, maxNumber: Number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value != null && (isNaN(c.value) || c.value < minNumber || c.value > maxNumber)) {
      return { "range": true };
    }
    return null
  };
}
function emailConfirmation(c: AbstractControl): { [key: string]: boolean } | null {
  const email = c.get("email");
  const confirmationEmail = c.get("confirmEmail");

  if (email.pristine || confirmationEmail.pristine) {
    return null;
  }
  if (email.value != confirmationEmail.value) {
    return { "match": true }
  }
  return null;
}
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customer = new Customer();
  customerForm: FormGroup;
  emailMessage: string;
  private validationMessages = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  };
  public get addresses() : FormArray {
    return <FormArray>this.customerForm.get('addresses');
  }
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', Validators.required],
      }, { validator: emailConfirmation }),
      phone: '',
      notification: 'email',
      rating: [null, ratingValidator(1, 5)],
      sendCatalog: true,
      addresses: this.fb.array([this.buildAddresses()])
    });

    /*this.customerForm = new FormGroup({
     firstName : new FormControl(),
     lastName : new FormControl(),
     email : new FormControl(),
     sendCatalog : new FormControl(true)
    });*/

    this.customerForm.patchValue({ lastName: 'pecho muy Gorda' });

    const notificationControl = this.customerForm.get('notification');
    notificationControl.valueChanges.subscribe(value=> {
      this.setNotificationValidation(value);
    });
    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setMessage(emailControl)
    );
  }
  setNotificationValidation(value: string) {
    console.log(value);
    if (value === 'text') {
      this.customerForm.get('phone').setValidators([Validators.required]);
    }
    if (value === 'email') {
      this.customerForm.get('phone').clearValidators();
    }

    this.customerForm.get('phone').updateValueAndValidity()
  }
  save() {
  }
  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    console.log(this.validationMessages);
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.emailMessage += this.validationMessages[key]).join(' ');
    }
  }
  addAddresses():void {
    this.addresses.push(this.buildAddresses());
  }
  buildAddresses():FormGroup{
    return this.fb.group({
      addressType: 'home',
      street1: ['', Validators.required],
      street2: '',
      city: '',
      state: '',
      zip: ''
    });
  }
}
