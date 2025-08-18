export interface SignUpDto {
  username: string;
  email: string;
  password: string;
}
export class LoginDto {
  username?: string;
  email?: string;
  password!: string;

  constructor(data: Partial<LoginDto>) {
    Object.assign(this, data);

    if (!this.username && !this.email) {
      throw new Error("Either username or email is required");
    }
    if (!this.password) {
      throw new Error("Password is required");
    }
  }
}
