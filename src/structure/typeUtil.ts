type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

type GetReadonlyKeys<
    T,
    U extends Readonly<T> = Readonly<T>,
    K extends keyof T = keyof T
> = K extends keyof T ? Equal<Pick<T, K>, Pick<U, K>> extends true ? K : never : never;

type ExcludeType<T, U> = {
    [P in keyof T as T[P] extends U ? never : P]: T[P]
};
type ExtractArrayType<T> = T extends (infer U)[] ? U : T;


export type ClassFields<T> = {
    [Key in GetReadonlyKeys<T>]: T[Key]
};

export type Merge<Obj> = {
    [Key in keyof Obj]: Obj[Key]
} & unknown;

export type ExtractType<T> = ExtractArrayType<T>;


export type RemoveArrayTypes<T> = ExcludeType<T, any[]>;