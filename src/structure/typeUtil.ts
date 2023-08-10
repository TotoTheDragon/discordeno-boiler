export type Mergify<TObj> = {
    [Key in keyof TObj]: TObj[Key];
  } & unknown; // Adding `& unknown` forces TS to "resolve" the type

  export type AddProperty<A extends object, Key extends string, ReturnType, Required extends boolean> =
  Required extends true 
  ? Mergify<A & {[property in Key]: ReturnType}>
  : Mergify<A & {[property in Key]?: ReturnType}>