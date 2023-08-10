import { Client } from "#service/structure/client.js";
import { ModalFieldBuilder } from "#service/structure/modal/builder.js";
import { ActionRow, InputTextComponent, MessageComponentTypes, TextStyles } from "@discordeno/types";

export type ModalFieldParseFunction<ReturnType> = (client: Client, input: string) => ReturnType | Promise<ReturnType>;

export default class ModalField<ReturnType extends any, _Key extends string, _R extends boolean> {
    private readonly _component: InputTextComponent;

    constructor(
        customId: string,
        label: string,
        style: TextStyles,
        required: boolean,
        placeholder?: string,
        minLength?: number,
        maxLength?: number,
    ) {
        this._component = {
            type: MessageComponentTypes.InputText,
            customId,
            label,
            style,
            required,
            placeholder,
            minLength,
            maxLength
        }
    }

    public getName(): string {
        return this._component.customId;
    }

    public component(overrides?: Partial<InputTextComponent>): ActionRow {
        return {
            type: MessageComponentTypes.ActionRow,
            components: [{
                ...this._component,
                ...overrides
            }]
        }
    }

    public static builder<T = string>(): ModalFieldBuilder<T> {
        return new ModalFieldBuilder();
    }
}