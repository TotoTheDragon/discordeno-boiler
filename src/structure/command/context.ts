import { Client } from "#service/structure/client.js";
import Argument from "#service/structure/command/argument.js";
import Command from "#service/structure/command/command.js";
import DiscordValidationError from "#service/structure/error/DiscordValidationError.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { getCommandAnswers, getCommandDataOptions } from "#service/structure/util.js";
import { Interaction, InteractionCallbackData } from "@discordeno/bot";

export default class CommandContext<Arguments extends KeyValueMap> {

    private readonly _command: Command<Arguments>;
    readonly interaction: Interaction;
    arguments!: Arguments;

    constructor(command: Command<Arguments>, interaction: Interaction) {
        this._command = command;
        this.interaction = interaction;
    }

    async parseArguments(client: Client, checkMissing = true): Promise<void> {
        this.arguments = await new ArgumentParseContext<Arguments>(this._command.getArguments(), this.interaction).parse(client, checkMissing);
    }

    async defer(ephemeral = true): Promise<void> {
        await this.interaction.defer(ephemeral);
    }

    async respond(response: string | InteractionCallbackData, ephemeral?: boolean): Promise<void> {
        await this.interaction.respond(response, { isPrivate: ephemeral });
    }

}

export class AutocompleteContext<Arguments extends KeyValueMap> {
    private readonly _arguments: Argument<KeyValueMap, unknown, string, boolean>[];
    private readonly _interaction: Interaction;
    readonly value: string | number;
    arguments!: Arguments;

    constructor(args: Argument<KeyValueMap, unknown, string, boolean>[], interaction: Interaction) {
        this._arguments = args;
        this._interaction = interaction;
        const options = getCommandDataOptions(interaction);
        console.log(options.find(o => o.focused));
        this.value = options.find(o => o.focused)!.value! as string | number;
    }

    async parseArguments(client: Client): Promise<void> {
        this.arguments = await new ArgumentParseContext<Arguments>(this._arguments, this._interaction).parse(client, false);
    }
}

export class ArgumentParseContext<Arguments extends KeyValueMap> {

    private readonly _arguments: Argument<KeyValueMap, unknown, string, boolean>[];
    private readonly _interaction: Interaction;

    constructor(args: Argument<KeyValueMap, unknown, string, boolean>[], interaction: Interaction) {
        this._arguments = args;
        this._interaction = interaction;
    }

    async parse(client: Client, checkMissing = true): Promise<Arguments> {
        // Extract argument answers
        const args = Object.fromEntries(getCommandAnswers(this._interaction)) as any;

        // Missing fields should never occur. This is just a sanity check
        if (checkMissing) {
            const missing = this._arguments
                .filter(argument => argument.isRequired)
                .filter(argument => !(argument.getName() in args));
            if (missing.length > 0) {
                throw new DiscordValidationError();
            }
        }

        // Parse arguments
        for (const argument of this._arguments) {
            const name = argument.getName();
            if (name in args) {
                args[name] = await argument.parse(client, this as ArgumentParseContext<any>, args[name]);
            }
        }

        return args as Arguments;
    }

}