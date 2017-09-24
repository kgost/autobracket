export class Match {
	constructor( 
		public _id: string,
		public tournamentId: number,
		public id: number,
		public player1: {
			id: number,
			name: string
		},
		public player2: {
			id: number,
			name: string
		},
		public scores_csv: string,
		public winner_id: number ) {}
}
