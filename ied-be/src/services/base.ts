import { Document } from "mongoose";

export interface BaseService<T> {
    findById(id: string): Promise<T | null>;
}