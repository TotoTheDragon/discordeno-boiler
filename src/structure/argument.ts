// import { Command } from "src/structure/command.js";
// import { implementsStatic } from "src/structure/decorators.js";

import { ApplicationCommandOptionTypes, DiscordApplicationCommandOption } from "@discordeno/bot";
import { Buildable, BuildableMetadata } from "./builder.js";
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

    static metadata(): Record<keyof ClassFields<Argument>, Partial<BuildableMetadata>> {
        return {
            type: {},
            name: {},
            description: {},
            required: {},
            autocomplete: {},
            min_value: {},
            max_value: {},
            min_length: {},
            max_length: {}
        }
    }

    public asOption(): DiscordApplicationCommandOption {
        return this;
    }
}