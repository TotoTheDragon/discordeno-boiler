import { Append, ClassFields, ExtractType, Merge, RemoveArrayTypes, ReturnTypeOrType } from "src/structure/typeUtil.js";

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

type BuildableFunction<T> = T | ((v: Builder<T>) => T) | ((v: Builder<T>) => Builder<T>);

type GetName<Type, Key extends string> = Type extends any[] ? Key extends `${infer key}s` ? key : Key : Key;

type BuilderSetFunction<
    Key extends string,
    ValueType,
    BuilderReturnType,
    Values extends Record<string, any>
> = ValueType extends Buildable<any>
    ? BuilderSetBuildableFunction<Key, ValueType, BuilderReturnType, Values>
    : BuilderSetGenericFunction<Key, ValueType, BuilderReturnType, Values>;

type BuilderSetGenericFunction<
    Key extends string,
    ValueType,
    BuilderReturnType,
    Values extends Record<string, any>
> = ValueType extends any[]
    ? <U extends ExtractType<ValueType>>(arr_value: U) => Builder<BuilderReturnType, Merge<Omit<Values, Key> & { [key in Key]: Append<U, Values[Key]> }>>
    : <U extends ValueType>(value: U) => Builder<BuilderReturnType, Merge<Values & { [key in Key]: U }>>;

type BuilderSetBuildableFunction<
    Key extends string,
    ValueType extends Buildable<any>,
    BuilderReturnType,
    Values extends Record<string, any>
> = ValueType extends any[]
    ? <U extends ExtractType<ValueType>, V extends BuildableFunction<U>>(arr_builder: V) => Builder<BuilderReturnType, Merge<Omit<Values, Key> & { [key in Key]: Append<ReturnTypeOrType<V>, Values[Key]> }>>
    : <U extends ValueType>(builder: U) => Builder<BuilderReturnType, Merge<Values & { [key in Key]: U }>>;


export type Builder<
    BuilderReturnType,
    FieldValues extends Record<string, any> = {},
    FieldsToSet = Omit<ClassFields<BuilderReturnType>, keyof RemoveArrayTypes<FieldValues>>,
> =
    { build: () => BuilderReturnType & Buildable<FieldValues> } &
    {
        [Key in keyof FieldsToSet & string as GetName<FieldsToSet[Key], Key>]: BuilderSetFunction<Key, FieldsToSet[Key], BuilderReturnType, FieldValues>
    };

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