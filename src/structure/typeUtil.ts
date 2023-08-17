export type IfElse<X, A, B> = X extends true ? A : B;

export type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
    T
>() => T extends Y ? 1 : 2
    ? A
    : B;

export type ReadonlyKeys<T> = {
    [P in keyof T]-?: IfEquals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] },
        never,
        P
    >;
}[keyof T];

export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type ReadonlyFields<T> = Pick<T, ReadonlyKeys<T>>;
export type RequiredFields<T> = Pick<T, RequiredKeys<T>>;

type ExcludeType<T, U> = {
    [P in keyof T as T[P] extends U ? never : P]: T[P]
};

export type RemoveReadonly<T> = {
    -readonly [Key in keyof T]: T[Key];
}

export type ClassFields<T> = RemoveReadonly<ReadonlyFields<T>>;
export type RequiredClassFields<T> = RemoveReadonly<RequiredFields<ReadonlyFields<T>>>;
export type GetRequired<T> = { [P in keyof T as T[P] extends Required<T>[P] ? P : never]: T[P] };
export type IsEmpty<T> = [keyof T] extends [never] ? true : false;
export type Merge<Obj> = {
    [Key in keyof Obj]: Obj[Key]
} & unknown;

export type ExtractType<T> = ExtractArrayType<T>;
type ExtractArrayType<T> = T extends (infer U)[] ? U : T;

export type RemoveArrayTypes<T> = ExcludeType<T, any[]>;

export type ReturnTypeOrType<T> = T extends (...args: any[]) => infer R ? R : T;

export type Push<I, T extends unknown[] = []> = T extends any[] ? [...T, I] : [I];

export type IsArray<T> = T extends any[] ? true : false;
