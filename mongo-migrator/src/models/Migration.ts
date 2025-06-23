import mongoose, { Schema, Document } from "mongoose";

interface IMigration extends Document {
	timestamp: number;
	name: string;
	executedAt: Date;
}

const MigrationSchema: Schema = new Schema({
	timestamp: { type: Number, required: true, unique: true },
	name: { type: String, required: true },
	executedAt: { type: Date, required: true, default: Date.now },
});

export const Migration = mongoose.model<IMigration>(
	"Migration",
	MigrationSchema,
);
