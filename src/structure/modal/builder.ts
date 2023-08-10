import DiscordInvalidLength from "#service/structure/error/DiscordInvalidLengthError.js";
import ModalField from "#service/structure/modal/field.js";
import Modal, { ModalSubmitFunction } from "#service/structure/modal/modal.js";
import { TextStyles } from "@discordeno/bot";

type ModalFieldBuilderFunction = (builder: ModalFieldBuilder) => ModalFieldBuilder;

export class ModalBuilder {

    private _customId?: string;
    private _title?: string;
    private _fields: ModalField[];

    private _handler?: ModalSubmitFunction;

    constructor() {
        this._fields = [];
    }

    /*
        Functions to set variables
    */
    public id(id: string): this {
        this._customId = id;
        return this;
    }

    public title(title: string): this {
        this._title = title;
        return this;
    }

    public field(value: ModalField | ModalFieldBuilder | ModalFieldBuilderFunction): this {
        if (value instanceof ModalField) {
            this._fields.push(value);
        } else if (value instanceof ModalFieldBuilder) {
            this._fields.push(value.build());
        } else {
            this._fields.push(value(new ModalFieldBuilder()).build());
        }
        return this;
    }

    public handle(handler: ModalSubmitFunction): Modal {
        this._handler = handler;
        return this.build();
    }

    /*
        Functions to deal with building
    */
    public validate(): void {
        if (this._customId === undefined) {
            throw new Error();
        }
        if (this._customId.length > 100) {
            throw new DiscordInvalidLength("custom_id", this._customId);
        }
        if (this._title === undefined) {
            throw new Error("A title is required");
        }
        if (!this._fields) {
            throw new Error("You need atleast 1 field");
        }
    }

    public build(): Modal {
        // Validation will throw error if not valid
        this.validate();

        // After validation, we can safely assume all the needed variables exist
        return new Modal(
            this._customId!,
            this._title!,
            this._fields!,
            this._handler!
        );
    }
}

export class ModalFieldBuilder {

    private _label?: string;
    private _customId?: string;
    private _style?: TextStyles;
    private _required?: boolean;

    private _placeholder?: string
    private _minLength?: number;
    private _maxLength?: number;

    constructor() {
        this._style = TextStyles.Short;
        this._required = false;
    }

    /*
        Functions to set variables
    */
    public id(id: string): this {
        this._customId = id;
        return this;
    }

    public label(label: string): this {
        this._label = label;
        return this;
    }

    public style(style: TextStyles): this {
        this._style = style;
        return this;
    }

    public required(): this {
        this._required = true;
        return this;
    }

    public placeholder(placeholder: string): this {
        this._placeholder = placeholder;
        return this;
    }

    public minLength(length: number): this {
        this._minLength = length;
        return this;
    }

    public maxLength(length: number): this {
        this._maxLength = length;
        return this;
    }

    /*
      Functions to deal with building
  */
    public validate(): void {
        if (this._customId === undefined) {
            throw new Error();
        }
        if (this._customId.length > 100) {
            throw new DiscordInvalidLength("custom_id", this._customId);
        }
        if (this._label === undefined) {
            throw new Error("A label is required");
        }
    }

    public build(): ModalField {
        // Validation will throw error if not valid
        this.validate();

        // After validation, we can safely assume all the needed variables exist
        return new ModalField(
            this._customId!,
            this._label!,
            this._style!,
            this._required!,
            this._placeholder,
            this._minLength,
            this._maxLength,
        );
    }

}