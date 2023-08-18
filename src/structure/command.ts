import { ApplicationCommandOptionTypes, ApplicationCommandTypes, CreateApplicationCommand, DiscordApplicationCommandOption } from "@discordeno/types";
import { Argument } from "./argument.js";
import { Buildable } from "./builder.js";
import { ClassFields } from "./typeUtil.js";

export type CommandFunction<Values = {}> = (client: object, values: Values) => void;

export class Command extends Buildable<any> {

    readonly name!: string;
    readonly description!: string;
    readonly options!: Argument[];
    readonly subcommand?: string;
    readonly subgroup?: string;

    readonly execute!: CommandFunction;

    private readonly type: number;

    constructor(data: ClassFields<Command>) {
        super();
        Object.assign(this, data);
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