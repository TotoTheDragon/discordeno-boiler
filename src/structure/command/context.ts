import { Client } from "#service/structure/client.js";
import Command from "#service/structure/command/command.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { getCommandAnswers, getCommandDataOptions, getCommandOptionsByPath } from "#service/structure/util.js";
import { Interaction, InteractionCallbackData } from "@discordeno/bot";

export default class CommandContext<Arguments extends KeyValueMap> {

    private readonly _command: Command<Arguments>;
    readonly interaction: Interaction;
    arguments!: Arguments;

    constructor(command: Command<Arguments>, interaction: Interaction) {
        this._command = command;
        this.interaction = interaction;
    }

    async parseArguments(client: Client): Promise<void> {
        // Arguments can only be parsed once
        if (this.arguments) {
            return;
        }

        // Extract argument answers
        const args = Object.fromEntries(getCommandAnswers(this.interaction)) as any;

        // Missing fields should never occur. This is just a sanity check
        const missing = this._command.getArguments()
            .filter(argument => argument.isRequired)
            .filter(argument => !(argument.getName() in args));
        if (missing.length > 0) {
            throw new Error();
        }

        // Parse arguments
        for (const argument of this._command.getArguments()) {
            const name = argument.getName();
            if (name in args) {
                args[name] = await argument.parse(client, args[name]);
            }
        }

        this.arguments = args;
    }

    async defer(ephemeral = true): Promise<void> {
        await this.interaction.defer(ephemeral);
    }

    async respond(response: string | InteractionCallbackData, ephemeral?: boolean): Promise<void> {
        await this.interaction.respond(response, { isPrivate: ephemeral });
    }

}