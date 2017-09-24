import { Match } from './match';

export class Tournament {
	constructor( 
		public id: number,
		public name: string,
		public liveMatches: Match[] ) {}
}
