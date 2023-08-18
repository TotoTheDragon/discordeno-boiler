import { ApplicationCommandOptionTypes, ApplicationCommandTypes, CreateApplicationCommand, DiscordApplicationCommandOption } from "@discordeno/types";
import { Argument } from "./argument.js";
import { Buildable } from "./builder.js";
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

    static fields(): Record<keyof ClassFields<Command>, any> {
        return {
            name: undefined,
            description: undefined,
            options: [],
            subcommand: undefined,
            subgroup: undefined,
            execute: undefined
        }
    }

    static constructors() {
        return { options: Argument }
    }
}