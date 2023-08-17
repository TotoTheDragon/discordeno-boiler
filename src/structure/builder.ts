import { ClassFields, ExtractType, Merge, RemoveArrayTypes } from "src/structure/typeUtil.js";
import { Command } from "./command.js";
import { ApplicationCommandOptionTypes } from "@discordeno/bot";
import { Argument } from "src/structure/argument.js";

// type ClassBuilder<C, Required extends keyof C, Optional extends keyof C> = {
//     -readonly [Key in keyof T]: SetFunction<T[Key]>
// }

type SetFunction<Type> = Type extends never ? never : (value: Type) => void;

type RequiredKeys<T> = keyof { [K in keyof T as {} extends Pick<T, K> ? never : K]: T[K] }

type HasRequiredFields<T> = RequiredKeys<T> extends never ? false : true;

// type x =  ClassBuilder<Command>;
// const a: x;

/*
    Command.builder()
        .argument(x) Builder<Command, >
        .handle(context => {
            context.arguments.x;
        })


*/


// FieldsNotSet extends Partial<ClassParameters<T>> = ClassParameters<T>, 


// type HandleFunction<T extends Builder<any, any, any>> = T extends Builder<Command, infer FieldsNotSet, infer Values> ?
//     HasRequiredFields<FieldsNotSet> extends false ?
//     (args: Values) => void
//     : never
//     : never;


// const x: HandleFunction<Builder<Command, {}>> = (args) => {
//     args
// };


export abstract class Buildable<Values> {

    static builder<T extends Buildable<any>>(this: new (...args: any[]) => T): Builder<T> {
        return createBuilder(this.prototype);
    }

    static defaults(): Record<string, any> {
        return {};
    }

    static constructors(): Record<string, any> {
        return {};
    }
}

// export interface Buildable<T> {
//     builder(): Builder<T>;
//     defaults(): Partial<ClassFields<T>>;
// }

type GetName<Type, Key extends string> = Type extends any[] ? Key extends `${infer key}s` ? key : Key : Key;

type Append<I, T extends unknown[] = []> = T extends any[] ? [...T, I] : [I];

type BuilderSetFunction<
    Key extends string,
    ValueType,
    BuilderReturnType,
    Values extends Record<string, any>
> = ValueType extends Buildable<any>
    ? BuilderSetBuildableFunction<Key, ValueType, BuilderReturnType, Values>
    : BuilderSetGenericFunction<Key, ValueType, BuilderReturnType, Values>;

type y = ApplicationCommandOptionTypes extends Buildable<any> ? string : number;
type x = BuilderSetFunction<"a", ApplicationCommandOptionTypes, Argument, {}>;

type BuilderSetGenericFunction<
    Key extends string,
    ValueType,
    BuilderReturnType,
    Values extends Record<string, any>
> = ValueType extends any[]
    ? <U extends ExtractType<ValueType>>(arr_value: U) => Builder<BuilderReturnType, Merge<Omit<Values, Key> & { [key in Key]: Append<U, Values[Key]> }>>
    : <U extends ValueType>(value: U) => Builder<BuilderReturnType, Merge<Values & { [key in Key]: U }>>;

type BuildableFunction<T> = T | ((v: Builder<T>) => T) | ((v: Builder<T>) => Builder<T>);
type RT<T> = T extends (...args: any[]) => any ? ReturnType<T> : T;

type BuilderSetBuildableFunction<
    Key extends string,
    ValueType extends Buildable<any>,
    BuilderReturnType,
    Values extends Record<string, any>
> = ValueType extends any[]
    ? <U extends ExtractType<ValueType>, V extends BuildableFunction<U>>(arr_builder: V) => Builder<BuilderReturnType, Merge<Omit<Values, Key> & { [key in Key]: Append<RT<V>, Values[Key]> }>>
    : <U extends ValueType>(builder: U) => Builder<BuilderReturnType, Merge<Values & { [key in Key]: U }>>;

type BuilderFunctions<
    T,
    FieldValues extends Record<string, any>,
    FieldsNotSet
> = {
        [Key in keyof FieldsNotSet & string as GetName<FieldsNotSet[Key], Key>]: BuilderSetFunction<Key, FieldsNotSet[Key], T, FieldValues>
    };

export type Builder<
    T,
    FieldValues extends Record<string, any> = {},
    FieldsToSet = Omit<ClassFields<T>, keyof RemoveArrayTypes<FieldValues>>,
> = BuilderFunctions<T, FieldValues, FieldsToSet> & { build: () => T & Buildable<FieldValues> };

export function createBuilder<T extends Buildable<any>>(constructor: typeof Buildable, values?: any): Builder<T> {
    return new Proxy<any, Builder<T>>(
        values ?? constructor.defaults(),
        {
            apply(target, thisArg, argArray) {
                console.log("apply", target, thisArg, argArray);
            },
            get(target, thisArg, argArray) {
                return (value: string) => {
                    const newTarget = target;
                    // Handle array type not ending in s
                    if (Array.isArray(newTarget[thisArg])) {
                        newTarget[thisArg].push(value);
                    }
                    // Handle array type ending in s
                    else if (typeof thisArg === "string" && Array.isArray(newTarget[thisArg + 's'])) {
                        newTarget[thisArg + 's'].push(value);
                    }
                    // Handle all other types
                    else {
                        newTarget[thisArg] = value;
                    }
                    console.log(newTarget);
                    return createBuilder(constructor, newTarget);
                };
            }
        }
    );
}

declare global {
    interface ProxyConstructor {
        new <TSource extends object, TTarget extends object>(target: TSource, handler: ProxyHandler<TSource>): TTarget;
    }
}