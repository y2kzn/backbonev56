import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  discordId: string;
  username: string;
  tournamentsWonCount: number;
}

const UserSchema = new Schema<IUser>({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  tournamentsWonCount: { type: Number, default: 0 }
});

export const User = model<IUser>('User', UserSchema);
