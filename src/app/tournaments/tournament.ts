import { Match } from './match';

export class Tournament {
	constructor( 
		public _id: string,
		public id: number,
		public name: string,
		public url: string,
		public streams: number,
		public matches: Match[],
		public liveMatches: Match[],
		public streamMatches: Match[] ) {}
}
