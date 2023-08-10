import { ModalFieldBuilder } from "#service/structure/modal/builder.js";
import { ActionRow, InputTextComponent, MessageComponentTypes, TextStyles } from "@discordeno/types";

export default class ModalField {
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

    public static builder(): ModalFieldBuilder {
        return new ModalFieldBuilder();
    }
}