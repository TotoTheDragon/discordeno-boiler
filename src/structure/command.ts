import { ApplicationCommandOptionTypes, ApplicationCommandTypes, CreateApplicationCommand, DiscordApplicationCommandOption } from "@discordeno/types";
import { Argument } from "./argument.js";
import { Buildable, BuildableMetadata } from "./builder.js";
import { ClassFields } from "./typeUtil.js";

export type CommandFunction<Values = {}> = (client: object, values: Values) => void;

export interface Command {
    readonly execute: CommandFunction;
    readonly name: string;
    readonly description: string;
    readonly options: Argument[];
    readonly subcommand?: string;
    readonly subgroup?: string;
}

export class Command extends Buildable<any> {

    static metadata(): Record<keyof ClassFields<Command>, Partial<BuildableMetadata>> {
        return {
            name: {},
            description: {},
            options: {default: [], ctor: Argument},
            subcommand: {},
            subgroup: {},
            execute: {}
        }
    }

    public asApplicationCommand(): DiscordApplicationCommandOption | CreateApplicationCommand {
        return {
            name: this.name,
            description: this.description,
            options: this.options.map(argument => argument.asOption()),
            type: this.subgroup || this.subcommand ?
                ApplicationCommandOptionTypes.SubCommand :
                ApplicationCommandTypes.ChatInput,
        }
    }
}

type x = keyof ReturnType<typeof Command['metadata']>;