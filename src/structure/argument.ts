// import { Command } from "src/structure/command.js";
// import { implementsStatic } from "src/structure/decorators.js";

import { ApplicationCommandOptionTypes } from "@discordeno/bot";
import { Buildable } from "./builder.js";
import { ClassFields } from "./typeUtil.js";

// function f(key: string): any {
//     console.log("evaluate: ", key);
//     return function () {
//         console.log("call: ", key);
//     };
// }

// export class Argument {

//     readonly name: string;

//     @f("type")
//     readonly type: ApplicationCommandOptionTypes;


//     public asOption(): DiscordApplicationCommandOption {
//         return {
//             name: this.name,

//         }
//     }
// }
// type EnumValueMap<T> = { [K in keyof T]: string }
// // TODO deconstruct enums to also be types
// type x = keyof typeof ApplicationCommandOptionTypes;

export class Argument extends Buildable<any> {

    readonly type!: ApplicationCommandOptionTypes;
    /**
     * Name of command, 1-32 characters.
     */
    readonly name!: string;
    /** 1-100 character description */
    readonly description!: string;
    readonly required?: boolean;
    readonly autocomplete?: boolean;
    readonly min_value?: number;
    readonly max_value?: number;
    readonly min_length?: number;
    readonly max_length?: number;

    constructor(data: any){
        super();
        Object.assign(this, data);
    }

    static fields(): Record<keyof ClassFields<Argument>, any> {
        return {
            type: undefined,
            name: undefined,
            description: undefined,
            required: undefined,
            autocomplete: undefined,
            min_value: undefined,
            max_value: undefined,
            min_length: undefined,
            max_length: undefined
        }
    }
}