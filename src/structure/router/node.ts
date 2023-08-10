export enum Kind {
    Static = 0,
    Param = 1,
}

export default class Node<T> {
    label: number;
    prefix: string;
    children: Node<T>[];
    kind: Kind;
    map: {
        handler?: T;
        parameters?: string[];
    };

    constructor(prefix = "/", children: Node<T>[] = [], kind = Kind.Static, map = {}) {
        this.label = prefix.charCodeAt(0);
        this.prefix = prefix;
        this.children = children;
        this.kind = kind;
        this.map = map;
    }

    
    addChild(n: Node<T>) {
        this.children.push(n);
    }

    findChild(char: number, kind: Kind): Node<T> | undefined {
        return this.children.find((child) => child.label === char && child.kind === kind);
    }

    findChildWithLabel(char: number): Node<T> | undefined {
        return this.children.find((child) => child.label === char);
    }

    findChildByKind(kind: Kind): Node<T> | undefined {
        return this.children.find((child) => child.kind === kind);
    }

    addHandler(handler?: T, parameters?: string[]) {
        this.map = { handler, parameters };
    }
}