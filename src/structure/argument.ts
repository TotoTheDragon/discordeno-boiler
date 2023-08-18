// import { Command } from "src/structure/command.js";
// import { implementsStatic } from "src/structure/decorators.js";

import { ApplicationCommandOptionTypes, DiscordApplicationCommandOption } from "@discordeno/bot";
import { Buildable } from "./builder.js";
import { ClassFields } from "./typeUtil.js";

export interface Argument {
    readonly type: ApplicationCommandOptionTypes;
    readonly name: string;
    readonly description: string;
    readonly required?: boolean;
    readonly autocomplete?: boolean;
    readonly min_value?: number;
    readonly max_value?: number;
    readonly min_length?: number;
    readonly max_length?: number;
}

export class Argument extends Buildable<any> {
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

    public asOption(): DiscordApplicationCommandOption {
        return this;
    }
}