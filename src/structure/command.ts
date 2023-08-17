import { ApplicationCommandOptionTypes, ApplicationCommandTypes, CreateApplicationCommand, DiscordApplicationCommandOption } from "@discordeno/types";
import { Buildable, Builder, createBuilder } from "./builder.js";
import { implementsStatic } from "./decorators.js";
import { ClassFields } from "./typeUtil.js";
import { Argument } from "src/structure/argument.js";

export type CommandFunction<Values = {}> = (client: object, values: Values) => void;

export class Command extends Buildable<any> {

    readonly name: string;
    readonly description: string;
    readonly options: Argument[];
    readonly subcommand?: string;
    readonly subgroup?: string;

    readonly execute: CommandFunction;

    private readonly type: number;

    constructor(data: ClassFields<Command>) {
        super();
        this.name = data.name;
        this.description = data.description;
        this.options = data.options;
        this.subcommand = data.subcommand;
        this.subgroup = data.subgroup;
        this.execute = data.execute;
        this.type = this.subgroup || this.subcommand ?
            ApplicationCommandOptionTypes.SubCommand :
            ApplicationCommandTypes.ChatInput;
    }

    public asApplicationCommand(): DiscordApplicationCommandOption | CreateApplicationCommand {
        return {
            name: this.name,
            type: this.type,
            description: this.description,
            // options: this._options.map(argument => argument.asOption()),
        }
    }

    static defaults() {
        return {
            options: []
        }
    }

    static constructors() {
        return {
            options: Argument
        }
    }
}