export class AdminTournament {
	constructor( 
		public id: number,
		public name: string,
		public url: string,
		public started: boolean,
		public setups: number,
		public streams: number ) {}
}
