import { Client } from "#service/structure/client.js";
import { ArgumentTypeBuilder } from "#service/structure/command/builder.js";
import CommandContext, { AutocompleteContext } from "#service/structure/command/context.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { ApplicationCommandOption } from "@discordeno/bot";
import { DiscordApplicationCommandOption } from "@discordeno/types";

export type AutocompleteFunction<CommandArguments extends KeyValueMap> = (client: Client, context: AutocompleteContext<CommandArguments>) => string[] | number[] | Promise<string[]> | Promise<number[]>;

export type ArgumentParseFunction<CommandArguments extends KeyValueMap, ReturnType> = (client: Client, context: CommandContext<CommandArguments>, input: string | number | boolean | unknown) => ReturnType | Promise<ReturnType>;

export default class Argument<CommandArguments extends KeyValueMap, ReturnType extends any, _Key extends string, _R extends boolean> {

    private readonly _options: ApplicationCommandOption;
    readonly parse: ArgumentParseFunction<CommandArguments, ReturnType>;
    readonly autocomplete?: AutocompleteFunction<CommandArguments>;

    constructor(options: ApplicationCommandOption, parse: ArgumentParseFunction<CommandArguments, ReturnType>, autocomplete?: AutocompleteFunction<CommandArguments>) {
        this._options = options;
        this.parse = parse;
        this.autocomplete = autocomplete;
    }

    public get isRequired(): boolean {
        return Boolean(this._options.required);
    }

    public getName(): string {
        return this._options.name;
    }

    asOption(): DiscordApplicationCommandOption {
        return this._options;
    }

    public static builder(): ArgumentTypeBuilder {
        return new ArgumentTypeBuilder();
    }

}