import Modal from "#service/structure/modal/modal.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { getCommandOptionsByPath, getModalAnswers } from "#service/structure/util.js";
import { Interaction } from "@discordeno/bot";

export default class ModalSubmitContext<PathParameters extends KeyValueMap, Arguments extends KeyValueMap> {

    private readonly _pathParameters: Map<string, string>;
    private readonly _modal: Modal<PathParameters, Arguments>;
    readonly interaction: Interaction;
    arguments!: PathParameters & Arguments;

    constructor(modal: Modal<PathParameters, Arguments>, interaction: Interaction, args: Map<string, string>) {
        this._modal = modal;
        this.interaction = interaction;
        this._pathParameters = args;
    }

    async parseArguments(): Promise<void> {
        if (this.arguments) {
            return;
        }
        const args = Object.fromEntries(this._pathParameters) as any;

        const options = getModalAnswers(this.interaction);
        for (const field of this._modal.getFields()) {
            const name = field.getName();
            const value = options.get(field.getName());
            if (field.isRequired && !value) {
                throw new Error();
            }
            if (value) {
                args[name] = options.get(name);
            }
        }

        this.arguments = args;
    }

}