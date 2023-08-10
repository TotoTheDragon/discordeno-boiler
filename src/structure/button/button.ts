import { ButtonTypeBuilder } from "#service/structure/button/builder.js";
import ButtonContext from "#service/structure/button/context.js";
import { Client } from "#service/structure/client.js";
import { KeyValueMap } from "#service/structure/typeUtil.js";
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

export type ButtonFunction<PathParameters extends KeyValueMap> = (client: Client, context: ButtonContext<PathParameters>) => void | Promise<void>;

type ComponentOptions<PathParameters> = {
    parameters?: { [Key in keyof PathParameters]: string }
    overrides?: Partial<ButtonComponent>
}

export default abstract class Button {
    protected readonly _component: ButtonComponent;
    constructor(component: ButtonComponent) {
        this._component = component;
    }

    public static builder(): ButtonTypeBuilder {
        return new ButtonTypeBuilder();
    }
}

export class ExecutableButton<PathParameters extends KeyValueMap> extends Button {
    readonly execute: ButtonFunction<PathParameters>;

    constructor(
        handler: ButtonFunction<PathParameters>,
        style: ButtonStyles,
        label?: string,
        customId?: string,
        emoji?: PartialEmoji,
        disabled?: boolean,
    ) {
        super({
            type: MessageComponentTypes.Button,
            style,
            label,
            customId,
            emoji,
            disabled,
        })
        this.execute = handler;
    }

    public component(options?: ComponentOptions<PathParameters>): Component {
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
        url?: string,
        label?: string,
    ) {
        super({
            type: MessageComponentTypes.Button,
            style: ButtonStyles.Link,
            label,
            url,
        })
    }
}