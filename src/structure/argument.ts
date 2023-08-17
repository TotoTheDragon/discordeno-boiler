import { ApplicationCommandOptionTypes, DiscordApplicationCommandOption } from "@discordeno/types";
// import { Command } from "src/structure/command.js";
// import { implementsStatic } from "src/structure/decorators.js";

import { Buildable } from "src/structure/builder.js";
import { ClassFields } from "src/structure/typeUtil.js";

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

    readonly type: ApplicationCommandOptionTypes;
    /**
     * Name of command, 1-32 characters.
     */
    readonly name: string;
    /** 1-100 character description */
    readonly description: string;
    readonly required?: boolean;
    readonly autocomplete?: boolean;
    readonly min_value?: number;
    readonly max_value?: number;
    readonly min_length?: number;
    readonly max_length?: number;

    constructor(data: ClassFields<Argument>) {
        super();
        this.type = data.type;
        this.name = data.name;
        this.description = data.description;
        this.required = data.required;
        this.autocomplete = data.autocomplete;
        this.min_value = data.min_value;
        this.max_value = data.max_value;
        this.min_length = data.min_length;
        this.max_length = data.max_length;
    }
}