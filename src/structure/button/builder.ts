import { ButtonFunction, ExecutableButton, LinkButton, PartialEmoji } from "#service/structure/button/button.js";
import ValidationError from "#service/structure/error/ValidationError.js";
import { KeyValueMap, Params } from "#service/structure/typeUtil.js";
import { ButtonStyles } from "@discordeno/bot";

export class ButtonTypeBuilder {
    public url(url: string): LinkButtonBuilder {
        return new LinkButtonBuilder(url);
    }

    public id<P extends string>(id: P): ExecutableButtonBuilder<Params<P>>;

    public id(id: string): ExecutableButtonBuilder<any> {
        return new ExecutableButtonBuilder(id);
    }
}

export class LinkButtonBuilder {
    _label?: string;
    _url?: string;

    public constructor(url: string) {
        this._url = url;
    }

    public label(label: string): this {
        this._label = label;
        return this;
    }

    public build(): LinkButton {
        return new LinkButton(this._url, this._label)
    }
}

export class ExecutableButtonBuilder<PathParameters extends KeyValueMap = {}> {
    _handler?: ButtonFunction<PathParameters>;
    _style?: ButtonStyles;
    _label?: string;
    _customId?: string;
    _emoji?: PartialEmoji;
    _disabled?: boolean;

    public constructor(id: string) {
        this._customId = id;
        this._disabled = false;
    }

    /*
        Set variables
    */
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

    handle(handler: ButtonFunction<PathParameters>): ExecutableButton<PathParameters> {
        this._handler = handler;
        return this.build();
    }

    /*
        Build
    */
    private validate(): void {
        if (!this._style) {
            throw new ValidationError();
        }
        if (this._customId && this._style === ButtonStyles.Link) {
            throw new ValidationError();
        }
        if (this._customId && !this._handler) {
            throw new ValidationError();
        }
    }

    public build(): ExecutableButton<PathParameters> {
        this.validate();

        return new ExecutableButton(
            this._handler!,
            this._style!,
            this._label,
            this._customId,
            this._emoji,
            this._disabled
        );
    }

}