export class User {
	constructor( 
		public username: string,
		public password: string,
		public chlngUname?: string,
		public chlngKey?: string,
		public subDomain?: string ) {}
}
