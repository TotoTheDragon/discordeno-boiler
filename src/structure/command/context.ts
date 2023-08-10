import { Client } from "#service/structure/client.js";
import Command from "#service/structure/command/command.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { getCommandOptionsByPath } from "#service/structure/util.js";
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
        // Parse arguments
        this.arguments = {} as Arguments;
        const options = getCommandOptionsByPath(this.interaction, this._command.getFullName());
        for (const argument of this._command.getArguments()) {
            const option = options?.find(o => o.name === argument.getName());
            if (!option && argument.isRequired) {
                throw new Error();
            }
            if (option) {
                const value = await argument.parse(client, option.value);
                (this.arguments as any)[option.name] = value;
            }
        }
    }

    async defer(ephemeral = true): Promise<void> {
        await this.interaction.defer(ephemeral);
    }

    async respond(response: string | InteractionCallbackData, ephemeral?: boolean): Promise<void> {
        await this.interaction.respond(response, { isPrivate: ephemeral });
    }

}