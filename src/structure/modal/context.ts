import Modal from "#service/structure/modal/modal.js";
import { Interaction } from "@discordeno/bot";

export default class ModalSubmitContext<Arguments extends object> {
    
    private readonly _pathArguments: Map<string, string>;
    private readonly _modal: Modal<Arguments>;
    readonly interaction: Interaction;
    arguments!: Arguments;

    constructor(modal: Modal<Arguments>, interaction: Interaction, args: Map<string, string>){
        this._modal = modal;
        this.interaction = interaction;
        this._pathArguments = args;
    }

    async parseArguments(): Promise<void> {
        if (this.arguments){
            return;
        }
        const args = {} as any;
        for (const [key, value] of this._pathArguments) {
            args[key] = value;
        }

        this.arguments = args;
    }

}