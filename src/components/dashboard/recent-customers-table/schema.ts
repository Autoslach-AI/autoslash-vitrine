export interface RecentCustomerRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "Active" | "Pending" | "Inactive";
  billing: "Monthly" | "Annual";
  signupDate: string;
}
