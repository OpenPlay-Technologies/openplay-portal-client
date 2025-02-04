import {TransactionEffects} from "@mysten/sui/client";

export interface Balance {
    value: number
}

export interface Table {
    id: string,
    size: number
}

export interface VecSet<T> {
    contents: T[]
}

export interface VecMap<TKey, TValue> {
    contents: Map<TKey, TValue>
}

export interface Sender {
    address: string
}

export interface ObjectData {
    address: string;
    version: number;
    digest: string;
}
    