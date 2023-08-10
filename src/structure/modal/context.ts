import Modal from "#service/structure/modal/modal.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { getModalAnswers } from "#service/structure/util.js";
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
        // Convert path parameters to object
        const args = Object.fromEntries(this._pathParameters) as any;
        // Put modal answers into object
        Object.assign(args, Object.fromEntries(getModalAnswers(this.interaction)));

        // Missing fields should never occur. This is just a sanity check
        const missing = this._modal.getFields()
            .filter(field => field.isRequired)
            .filter(field => !(field.getName() in args));
        if (missing.length > 0) {
            throw new Error();
        }

        this.arguments = args;
    }

}