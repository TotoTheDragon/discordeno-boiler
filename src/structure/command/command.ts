import { Client } from "#service/structure/client.js";
import Argument from "#service/structure/command/argument.js";
import { CommandBuilder } from "#service/structure/command/builder.js";
import CommandContext from "#service/structure/command/context.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { Interaction } from "@discordeno/bot";
import { ApplicationCommandOptionTypes, ApplicationCommandTypes, CreateApplicationCommand, DiscordApplicationCommandOption } from "@discordeno/types";

export type CommandFunction<Arguments extends KeyValueMap> = (client: Client, context: CommandContext<Arguments>) => void | Promise<void>;

export default class Command<Arguments extends KeyValueMap> {

    private readonly _name: string;
    private readonly _description: string;
    private readonly _options: Argument<unknown, string, boolean>[];
    private readonly _subcommand?: string;
    private readonly _subgroup?: string;

    private readonly _type: number;

    readonly execute: CommandFunction<Arguments>;

    constructor(
        name: string,
        description: string,
        handler: CommandFunction<Arguments>,
        args: Argument<unknown, string, boolean>[],
        subcommand?: string,
        subgroup?: string
    ) {
        this.execute = handler;
        this._name = name;
        this._description = description;
        this._options = args;
        this._subcommand = subcommand;
        this._subgroup = subgroup;
        this._type = this._subgroup || this._subcommand ?
            ApplicationCommandOptionTypes.SubCommand :
            ApplicationCommandTypes.ChatInput;
    }

    public asApplicationCommand(): DiscordApplicationCommandOption | CreateApplicationCommand {
        return {
            name: this._name,
            type: this._type,
            description: this._description,
            options: this._options.map(argument => argument.asOption()),
        }
    }

    public getFullName(): string {
        return [this._subgroup, this._subcommand, this._name].filter(v => v !== undefined).join("/");
    }

    public getName(): string {
        return this._name;
    }

    public getSubcommand(): string | undefined {
        return this._subcommand;
    }

    public getSubgroup(): string | undefined {
        return this._subgroup;
    }

    public getArgument(name: string): Argument<unknown, string, boolean> | undefined {
        return this._options.find(a => a.getName() === name);
    }

    public getArguments(): Argument<unknown, string, boolean>[] {
        return this._options;
    }

    public createContext(interaction: Interaction): CommandContext<Arguments> {
        return new CommandContext(this, interaction);
    }

    public static builder(): CommandBuilder<{}> {
        return new CommandBuilder();
    }

}