import { Client } from "#service/structure/client.js";
import { ModalBuilder } from "#service/structure/modal/builder.js";
import ModalSubmitContext from "#service/structure/modal/context.js";
import ModalField from "#service/structure/modal/field.js";
import { parseParameters } from "#service/structure/util.js";
import { InputTextComponent, InteractionCallbackData } from "@discordeno/bot";

export type ModalSubmitFunction = (client: Client, context: ModalSubmitContext) => void | Promise<void>;

type InteractionOptions = {
    parameters?: { [key: string]: string }
    fieldOptions?: { [key: string]: Partial<InputTextComponent> }
};

export default class Modal {
    private readonly _customId: string;
    private readonly _title: string;
    private readonly _fields: ModalField[];
    readonly execute: ModalSubmitFunction;

    constructor(customId: string, title: string, fields: ModalField[], handler: ModalSubmitFunction) {
        this._customId = customId;
        this._title = title;
        this._fields = fields;
        this.execute = handler;
    }

    public getId() {
        return this._customId;
    }

    public interaction(options?: InteractionOptions): InteractionCallbackData {
        return {
            customId: parseParameters(this._customId, options?.parameters, true),
            title: this._title,
            components: this._fields.map(field => field.component(options?.fieldOptions?.[field.getName()]))
        }
    }

    public static builder(): ModalBuilder {
        return new ModalBuilder();
    }
}