import Node, { Kind } from "#service/structure/router/node.js";

const COLON = ":".charCodeAt(0);
const SLASH = "/".charCodeAt(0);

export default class Router<T> {
    tree: Node<T>;

    constructor() {
        this.tree = new Node();
    }

    public add(p: string, handler: T): void {
        // Parameters
        const parameters: string[] = [];

        let path = p;

        for (let i = 0, l = path.length; i < l; ++i) {
            const ch = path.charCodeAt(i);

            if (ch === COLON) {
                const paramStart = i + 1;

                this.insert(path.substring(0, i), Kind.Static);

                // Find first next occurence of slash
                while (i < l && path.charCodeAt(i) !== SLASH) {
                    i++;
                }

                // We have found the entire name of the parameter, add it to the list
                parameters.push(path.substring(paramStart, i))

                // Remove the parameter name from the path, leaving only the colon
                path = path.substring(0, paramStart) + path.substring(i);

                i = paramStart;
                l = path.length;

                // If we are at the end, we can finish up
                if (i === path.length) {
                    this.insert(path, Kind.Param, parameters, handler);
                    return;
                }
                this.insert(path.substring(0, i), Kind.Param, parameters);
            }
        }

        this.insert(path, Kind.Static, parameters, handler);
    }

    private insert(p: string, kind: Kind, parameters?: string[], handler?: T): void {
        // Start at the root node
        let current = this.tree;
        let path = p;

        while (true) {

            let l = 0;
            // Walk down until the path does not match the current tree
            const max = Math.min(path.length, current.prefix.length);
            while (l < max && path.charCodeAt(l) === current.prefix.charCodeAt(l)) {
                l++;
            }

            if (l < current.prefix.length) {
                // Path branches of before current end.

                // Create new node to insert
                const node = new Node<T>(current.prefix.substring(l), current.children, current.kind, current.map);
                // Overwrite parent to include this as child
                current.children = [node];

                // Adjust parent node
                current.label = current.prefix.charCodeAt(0);
                current.prefix = current.prefix.substring(0, l);
                current.map = {};
                current.kind = Kind.Static;

                if (l === path.length) {
                    // We are at the deepest level, directly handle
                    current.addHandler(handler, parameters);
                    current.kind = kind;
                } else {
                    // There is more of the path left, create a node for it
                    const node = new Node<T>(path.substring(l), [], kind);
                    node.addHandler(handler, parameters);
                    current.addChild(node);
                }
            } else if (l < path.length) {
                // Path has to branch of from current end
                // Find deepest child
                path = path.substring(l);
                const child = current.findChildWithLabel(path.charCodeAt(0));
                if (child) {
                    current = child;
                    continue;
                }
                // We have found the deepest child
                // Create a child node for this to handle the remaining path
                const node = new Node<T>(path, [], kind);
                node.addHandler(handler, parameters);
                current.addChild(node);
            } else if (handler) {
                // We already have this path, just add the handler
                current.addHandler(handler, parameters);
            }
            return;
        }
    }

    public find(p: string, node?: Node<T>, paramCount = 0, result: [T | undefined, Map<string, string>] = [undefined, new Map()]) {
        const current = node || this.tree;
        let path = p;
        let child: Node<T> | undefined;
        // We search in the following order of kind
        // Static > Param

        // We have found our node
        if (path.length === 0 || path === current.prefix) {
            result[0] = current.map.handler;

            if (current.map.parameters) {
                for (let i = 0; i < current.map.parameters.length; i++) {
                    result[1].set(current.map.parameters[i], result[1].get(i.toString())!);
                    result[1].delete(i.toString());
                }
            }

            return result;
        }

        let l = 0;
        // Walk down until the path does not match the current tree
        const max = Math.min(path.length, current.prefix.length);
        while (l < max && path.charCodeAt(l) === current.prefix.charCodeAt(l)) {
            l++;
        }

        if (l === current.prefix.length) {
            path = path.substring(l);
        }

        child = current.findChild(path.charCodeAt(0), Kind.Static);
        if (child) {
            this.find(path, child, paramCount, result);
            if (result[0]) {
                return result;
            }
        }

        // Was not able to find node
        if (l !== current.prefix.length) {
            return result;
        }

        // Check for a parameter node
        child = current.findChildByKind(Kind.Param);
        if (child) {
            let l = path.length;
            let i = 0;
            // Find first next occurence of slash
            while (i < l && path.charCodeAt(i) !== SLASH) {
                i++;
            }

            // Set value of param, by its index
            result[1].set(paramCount.toString(), path.substring(0, i));

            this.find(path.substring(i), child, paramCount + 1, result);

            if (result[0]) {
                return result;
            }

            // Not found, so remove param by its index
            result[1].delete(paramCount.toString());
        }

        return result;
    }
}