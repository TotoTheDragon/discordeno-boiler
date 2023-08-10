import Button, { ButtonFunction, ExecutableButton, LinkButton, PartialEmoji } from "#service/structure/button/button.js";
import { ButtonStyles } from "@discordeno/bot";

export class ButtonBuilder {
    _handler?: ButtonFunction;
    _style?: ButtonStyles;
    _label?: string;
    _customId?: string;
    _emoji?: PartialEmoji;
    _url?: string;
    _disabled?: boolean;

    constructor() {
        this._disabled = false;
    }

    /*
        Set variables
    */
    id(id: string): this {
        this._customId = id;
        return this
    }

    label(label: string): this {
        this._label = label;
        return this;
    }

    style(style: ButtonStyles): this {
        this._style = style;
        return this;
    }

    emoji(emoji: PartialEmoji): this {
        this._emoji = emoji;
        return this;
    }

    disabled(): this {
        this._disabled = true;
        return this;
    }

    url(url: string): Button {
        this._url = url;
        this.style(ButtonStyles.Link);
        return this.build();
    }

    handle(handler: ButtonFunction): Button {
        this._handler = handler;
        return this.build();
    }

    /*
        Build
    */
    private validate(): void {
        if (!this._style) {
            throw new Error();
        }
        if (this._customId && this._style === ButtonStyles.Link) {
            throw new Error();
        }
        if (this._customId && !this._handler) {
            throw new Error();
        }
    }

    public build(): Button {
        this.validate();

        switch (this._style!) {
            case ButtonStyles.Link: return new LinkButton(
                this._label,
                this._emoji,
                this._url,
                this._disabled
            )

            default: return new ExecutableButton(
                this._handler!,
                this._style!,
                this._label,
                this._customId,
                this._emoji,
                this._url,
                this._disabled
            );
        }
    }

}