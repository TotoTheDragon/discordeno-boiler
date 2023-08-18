import { ClassFields, ExtractType, IfElse, IsArray, IsEmpty, Merge, Push, RemoveArrayTypes, RequiredClassFields, ReturnTypeOrType } from "./typeUtil.js";

// This symbol is used a field on Buildable to make sure that the type system can properly pick up that it is an instance of Buildable
const BuildableSymbol = Symbol("buildable");

export interface BuildableMetadata {
    type: any;
    default?: any;
    ctor?: new (...args: any[]) => any
}

export interface Buildable<Values> {
    [BuildableSymbol]?: never;
}

export abstract class Buildable<Values> {

    constructor(data: any) {
        Object.assign(this, data);
    }

    static builder<T extends Buildable<any>>(this: new (...args: any[]) => T): Builder<T> {
        return createBuilder(this);
    }

    static metadata(): Record<string, Partial<BuildableMetadata>> {
        return {};
    }
}

type IsBuildable<T> = T extends Buildable<any> | Buildable<any>[] ? true : false;

type BuildableFunction<T> = T | ((v: Builder<T>) => T) | ((v: Builder<T>) => CanBuild<T, any>);
type GetName<Type, Key extends string> = Type extends any[] ? Key extends `${infer key}s` ? key : Key : Key;


export type MissingFields<T, FieldValues> = Omit<RequiredClassFields<T>, keyof FieldValues>;
export type FieldsToSet<T, FieldValues> = Omit<ClassFields<T>, keyof RemoveArrayTypes<FieldValues>>;


type BuilderSetFunction<
    Key extends string,
    ValueType,
    BuilderReturnType,
    Values extends Record<string, any>
> = IfElse<
    IsBuildable<ValueType>,
    BuilderSetFunctionHelper<Key, BuildableFunction<ExtractType<ValueType>>, BuilderReturnType, Values, IsArray<ValueType>>,
    BuilderSetFunctionHelper<Key, ExtractType<ValueType>, BuilderReturnType, Values, IsArray<ValueType>>
>;

type BuilderSetFunctionHelper<
    Key extends string,
    ValueType,
    BuilderReturnType,
    Values extends Record<string, any>,
    IsArray extends boolean
> = IfElse<
    IsArray,
    <V extends ValueType>(abz: V) => Builder<BuilderReturnType, Merge<Omit<Values, Key> & { [key in Key]: Push<ReturnTypeOrType<V>, Values[Key]> }>>,
    <V extends ValueType>(bz: V) => Builder<BuilderReturnType, Merge<Values & { [key in Key]: V }>>
>;

export type Builder<
    T,
    FieldValues extends Record<string, any> = {},
> = IfElse<
    IsEmpty<MissingFields<T, FieldValues>>,
    BuilderFunctions<T, FieldValues> & CanBuild<T, FieldValues>,
    BuilderFunctions<T, FieldValues>
>;


type BuilderFunctions<
    T,
    FieldValues extends Record<string, any>,
    Fields = FieldsToSet<T, FieldValues>
> = {
        [Key in keyof Fields & string as GetName<Fields[Key], Key>]: BuilderSetFunction<Key, Fields[Key], T, FieldValues>
    };

interface CanBuild<T, Values> {
    build(): T & Buildable<Values>;
}

const constructorFields: Record<string, string[]> = {};

export function createBuilder<T extends Buildable<any>>(clazz: new (...args: any[]) => T, values?: any): Builder<T> {
    const staticClazz = clazz.prototype.constructor as typeof Buildable;
    if (!constructorFields[clazz.toString()]) {
        constructorFields[clazz.toString()] = Object.getOwnPropertyNames(staticClazz.metadata())
    }
    const fields: string[] = constructorFields[clazz.toString()]!;
    const defaults = Object.fromEntries(Object.entries(staticClazz.metadata()).filter(([k, v]) => v.default !== undefined).map(([k, v]) => [k, v.default]));
    return new Proxy<any, Builder<T>>(
        values ?? defaults,
        {
            get(target, functionName) {
                return (value: any) => {
                    if (typeof functionName !== 'string') {
                        throw new Error("Can only index builders by strings");
                    }

                    // Handle building
                    if (functionName === "build") {
                        return new clazz(target);
                    }

                    const fieldName = fields.find(name => name === functionName) || fields.find(name => name.startsWith(functionName));
                    if (!fieldName) {
                        throw new Error("Was not able to find field by index: " + functionName);
                    }
                    const evaluatedValue = evaluateSetValue(value, staticClazz.metadata()[fieldName].ctor);
                    const newTarget = {
                        ...target
                    };

                    if (Array.isArray(newTarget[fieldName])) {
                        newTarget[fieldName].push(evaluatedValue);
                    } else {
                        newTarget[fieldName] = evaluatedValue;
                    }
                    return createBuilder(clazz, newTarget);
                };
            }
        }
    );
}

function evaluateSetValue(value: any, constructor?: new (...args: any[]) => any): any {
    if (value instanceof Function && constructor !== undefined) {
        const builder = value(createBuilder(constructor));
        return evaluateSetValue(builder)
    }
    if (value['build']) {
        return value.build();
    }
    return value;
}

declare global {
    interface ProxyConstructor {
        new <TSource extends object, TTarget extends object>(target: TSource, handler: ProxyHandler<TSource>): TTarget;
    }
}