export type Mergify<TObj> = {
    [Key in keyof TObj]: TObj[Key];
} & unknown; // Adding `& unknown` forces TS to "resolve" the type

export type AddProperty<A extends object, Key extends string, ReturnType, Required extends boolean> =
    Required extends true
    ? Mergify<A & { [property in Key]: ReturnType }>
    : Mergify<A & { [property in Key]?: ReturnType }>

export type IsParameter<Part> = Part extends `:${infer ParamName}` ? ParamName : never;
export type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}`
    ? IsParameter<PartA> | FilteredParts<PartB>
    : IsParameter<Path>;
export type Params<Path> = {
    [Key in FilteredParts<Path>]: string;
};

export type KeyValueMap = {[key: string]: any};