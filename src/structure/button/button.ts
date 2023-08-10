import { ButtonBuilder } from "#service/structure/button/builder.js";
import ButtonContext from "#service/structure/button/context.js";
import { Client } from "#service/structure/client.js";
import { parseParameters } from "#service/structure/util.js";
import { ButtonComponent, ButtonStyles, Component, MessageComponentTypes } from "@discordeno/bot";

export type PartialEmoji = {
    /** Emoji id */
    id?: bigint;
    /** Emoji name */
    name?: string;
    /** Whether this emoji is animated */
    animated?: boolean;
};

export type ButtonFunction = (client: Client, context: ButtonContext) => void | Promise<void>;

type ComponentOptions = {
    parameters?: { [key: string]: string }
    overrides?: Partial<ButtonComponent>
}

export default abstract class Button {
    protected readonly _component: ButtonComponent;
    constructor(component: ButtonComponent) {
        this._component = component;
    }

    public static builder(): ButtonBuilder {
        return new ButtonBuilder();
    }
}

export class ExecutableButton extends Button {
    readonly execute: ButtonFunction;

    constructor(
        handler: ButtonFunction,
        style: ButtonStyles,
        label?: string,
        customId?: string,
        emoji?: PartialEmoji,
        url?: string,
        disabled?: boolean,
    ) {
        super({
            type: MessageComponentTypes.Button,
            style,
            label,
            customId,
            emoji,
            url,
            disabled,
        })
        this.execute = handler;
    }

    public component(options?: ComponentOptions): Component {
        return {
            ...this._component,
            customId: parseParameters(this._component.customId, options?.parameters, true),
            ...options?.overrides, // Overrides are put last in case someone would like to override the customId
        };
    }

    public getId(): string {
        return this._component.customId!;
    }
}

export class LinkButton extends Button {
    constructor(
        label?: string,
        emoji?: PartialEmoji,
        url?: string,
        disabled?: boolean,
    ) {
        super({
            type: MessageComponentTypes.Button,
            style: ButtonStyles.Link,
            label,
            emoji,
            url,
            disabled,
        })
    }
}