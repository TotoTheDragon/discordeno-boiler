import { Client } from "#service/structure/client.js";
import { ModalBuilder } from "#service/structure/modal/builder.js";
import ModalSubmitContext from "#service/structure/modal/context.js";
import ModalField from "#service/structure/modal/field.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
import { parseParameters } from "#service/structure/util.js";
import { InputTextComponent, InteractionCallbackData } from "@discordeno/bot";

export type ModalSubmitFunction<PathParameters extends KeyValueMap, Fields extends KeyValueMap> = (client: Client, context: ModalSubmitContext<PathParameters, Fields>) => void | Promise<void>;

type InteractionOptions<PathParameters, Fields> = {
    parameters?: { [Key in keyof PathParameters]: string }
    fieldOptions?: { [Key in keyof Fields]?: Partial<InputTextComponent> }
};

export default class Modal<PathParameters extends KeyValueMap, Fields extends KeyValueMap> {
    private readonly _customId: string;
    private readonly _title: string;
    private readonly _fields: ModalField<unknown, string, boolean>[];
    readonly execute: ModalSubmitFunction<PathParameters, Fields>;

    constructor(customId: string, title: string, fields: ModalField<unknown, string, boolean>[], handler: ModalSubmitFunction<PathParameters, Fields>) {
        this._customId = customId;
        this._title = title;
        this._fields = fields;
        this.execute = handler;
    }

    public getId() {
        return this._customId;
    }

    public getFields(): ModalField<unknown, string, boolean>[] {
        return this._fields;
    }

    public interaction(options?: InteractionOptions<PathParameters, Fields>): InteractionCallbackData {
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