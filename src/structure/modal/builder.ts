import ValidationError from "#service/structure/error/ValidationError.js";
import ModalField from "#service/structure/modal/field.js";
import Modal, { ModalSubmitFunction } from "#service/structure/modal/modal.js";
import {  AddProperty, KeyValueMap, Params } from "#service/structure/typeUtil.js";
import { TextStyles } from "@discordeno/bot";

type ModalFieldBuilderFunction<
    ReturnType,
    Key extends string,
    Required extends boolean = false
> = (builder: ModalFieldBuilder) => ModalFieldBuilder<ReturnType, Key, Required>;

type ModalFieldOption<
    ReturnType,
    Key extends string,
    Required extends boolean
> = ModalField<ReturnType, Key, Required> |
    ModalFieldBuilder<ReturnType, Key, Required> |
    ModalFieldBuilderFunction<ReturnType, Key, Required>;

export class ModalBuilder<PathParameters extends KeyValueMap = {}, Fields extends KeyValueMap = {}> {

    private _customId?: string;
    private _title?: string;
    private _fields: ModalField<unknown, string, boolean>[];

    private _handler?: ModalSubmitFunction<PathParameters, Fields>;

    constructor() {
        this._fields = [];
    }

    /*
        Functions to set variables
    */
    public id<P extends string>(id: P): ModalBuilder<Params<P>, Fields>;

    public id(id: string): ModalBuilder<any, Fields> {
        this._customId = id;
        return this;
    }

    public title(title: string): this {
        this._title = title;
        return this;
    }

    public field<
        ReturnType,
        Key extends string,
        Required extends boolean
    >(value: ModalFieldOption<ReturnType, Key, Required>): ModalBuilder<PathParameters, AddProperty<Fields, Key, ReturnType, Required>>;

    public field(value: ModalFieldOption<unknown, string, boolean>): ModalBuilder<PathParameters, any> {
        if (value instanceof ModalField) {
            this._fields.push(value);
        } else if (value instanceof ModalFieldBuilder) {
            this._fields.push(value.build());
        } else {
            this._fields.push(value(new ModalFieldBuilder()).build());
        }
        return this;
    }

    public handle(handler: ModalSubmitFunction<PathParameters, Fields>): Modal<PathParameters, Fields> {
        this._handler = handler;
        return this.build();
    }

    /*
        Functions to deal with building
    */
    public validate(): void {
        if (this._customId === undefined) {
            throw new ValidationError("custom_id is missing");
        }
        if (this._customId.length > 100) {
            throw new ValidationError("custom_id is not allowed to be longer than 100 characters");
        }
        if (this._title === undefined) {
            throw new ValidationError("A title is required");
        }
        if (!this._fields) {
            throw new ValidationError("You need atleast 1 field");
        }
    }

    public build(): Modal<PathParameters, Fields> {
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

export class ModalFieldBuilder<ReturnType = string, Key extends string = string, Required extends boolean = false> {

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
    public id<U extends Key>(id: U): ModalFieldBuilder<ReturnType, U, Required> {
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

    public required(): ModalFieldBuilder<ReturnType, Key, true> {
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
            throw new ValidationError();
        }
        if (this._customId.length > 100) {
            throw new ValidationError("custom_id is not allowed to be longer than 100 characters");
        }
        if (this._label === undefined) {
            throw new ValidationError("A label is required");
        }
    }

    public build(): ModalField<ReturnType, Key, Required> {
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