import { Schema, model, Document } from 'mongoose';

export interface ITournament extends Document {
  name: string;
  phases: number;
  playersPerTeam: number;
  partySize: number;
  gameMode: string;
  startInMinutes: number;
  entryFee: number;
  region: string;
  prizepool: { position: number; reward: number }[];
  maps: string[];
  emotes: string[];
  createdAt: Date;
}

const TournamentSchema = new Schema<ITournament>({
  name: { type: String, required: true },
  phases: { type: Number, default: 1 },
  playersPerTeam: { type: Number, default: 32 },
  partySize: { type: Number, default: 1 },
  gameMode: { type: String, default: 'Padrão' },
  startInMinutes: { type: Number, default: 15 },
  entryFee: { type: Number, default: 0 },
  region: { type: String, default: 'South America (SA)' },
  prizepool: [
    {
      position: { type: Number },
      reward: { type: Number }
    }
  ],
  maps: [{ type: String }],
  emotes: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const Tournament = model<ITournament>('Tournament', TournamentSchema);
