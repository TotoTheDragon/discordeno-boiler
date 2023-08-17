export function implementsStatic<T>() {
    return <U extends T>(constructor: U) => {constructor};
}