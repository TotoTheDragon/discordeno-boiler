import DiscordValidationError from "#service/structure/error/DiscordValidationError.js";
import Modal from "#service/structure/modal/modal.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { getModalAnswers } from "#service/structure/util.js";
import { Interaction, InteractionCallbackData } from "@discordeno/bot";

export default class ModalSubmitContext<PathParameters extends KeyValueMap, Arguments extends KeyValueMap> {

    private readonly _modal: Modal<PathParameters, Arguments>;
    readonly interaction: Interaction;
    readonly parameters: PathParameters;
    arguments!: Arguments;

    constructor(modal: Modal<PathParameters, Arguments>, interaction: Interaction, args: Map<string, string>) {
        this._modal = modal;
        this.interaction = interaction;
        this.parameters = Object.fromEntries(args) as PathParameters;
    }

    async parseArguments(): Promise<void> {
        if (this.arguments) {
            return;
        }
        // Convert arguments to object
        const args = Object.fromEntries(getModalAnswers(this.interaction))  as any;

        // Missing fields should never occur. This is just a sanity check
        const missing = this._modal.getFields()
            .filter(field => field.isRequired)
            .filter(field => !(field.getName() in args));
        if (missing.length > 0) {
            throw new DiscordValidationError();
        }

        this.arguments = args;
    }

    async respond(response: string | InteractionCallbackData, ephemeral?: boolean): Promise<void> {
        await this.interaction.respond(response, { isPrivate: ephemeral });
    }
}