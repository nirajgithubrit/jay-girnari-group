export interface Customer {
  _id: string;
  name: string;
  phoneNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerForm {
  name: string;
  phoneNumber: string;
}
