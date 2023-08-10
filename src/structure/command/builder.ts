import Argument, { ArgumentParseFunction, AutocompleteFunction } from "#service/structure/command/argument.js";
import Command, { CommandFunction } from "#service/structure/command/command.js";
import { AddProperty, KeyValueMap } from "#service/structure/typeUtil.js";
import { ApplicationCommandOption, ApplicationCommandOptionTypes, Attachment } from "@discordeno/bot";

type ArgumentBuilderFunction<
    ReturnType,
    Key extends string,
    Required extends boolean = false
> = (builder: ArgumentTypeBuilder) => ArgumentBuilder<ReturnType, Key, Required>;

type ArgumentOption<
    Key extends string,
    ReturnType,
    Required extends boolean
> = Argument<ReturnType, Key, Required> |
    ArgumentBuilder<ReturnType, Key, Required> |
    ArgumentBuilderFunction<ReturnType, Key, Required>;

export class CommandBuilder<Arguments extends KeyValueMap = {}> {

    private _name?: string;
    private _description?: string;
    private _arguments: Argument<unknown, string, boolean>[];
    private _subcommand?: string;
    private _subgroup?: string;
    private _handler?: CommandFunction<Arguments>;

    constructor() {
        this._arguments = [];
    }

    /*
        Functions for builder
    */
    public name(name: string): this {
        this._name = name;
        return this;
    }

    public description(description: string): this {
        this._description = description;
        return this;
    }

    public subgroup(subgroup: string): this {
        this._subgroup = subgroup;
        return this;
    }

    public subcommand(subcommand: string): this {
        this._subcommand = subcommand;
        return this;
    }

    public argument<
        Key extends string,
        ReturnType,
        Required extends boolean
    >(value: ArgumentOption<Key, ReturnType, Required>): CommandBuilder<AddProperty<Arguments, Key, ReturnType, Required>>;


    public argument(value: ArgumentOption<string, unknown, boolean>): CommandBuilder<any> {
        if (value instanceof Argument) {
            if (this._arguments.find(a => a.getName() === value.getName())) {
                throw new Error("Cannot have 2 arguments with the same name");
            }
            this._arguments.push(value);
        } else if (value instanceof ArgumentBuilder) {
            return this.argument(value.build())
        } else {
            return this.argument(value(new ArgumentTypeBuilder()));
        }
        return this;
    }

    public handle(handler: CommandFunction<Arguments>): Command<Arguments> {
        this._handler = handler;
        return this.build();
    }

    /*
      Functions to deal with building
    */
    private validate(): void {
        if (!this._name) {
            throw new Error();
        }
        if (!this._description) {
            throw new Error();
        }
        if (!this._handler) {
            throw new Error();
        }
    }

    public build(): Command<Arguments> {
        // Validation will throw error if not valid
        this.validate();

        // After validation, we can safely assume all the needed variables exist
        return new Command(
            this._name!,
            this._description!,
            this._handler!,
            this._arguments,
            this._subcommand,
            this._subgroup,
        );
    }

}

export class ArgumentTypeBuilder {

    constructor() { }

    /*
    Types
*/
    public string(): ArgumentBuilder<string> {
        return new ArgumentBuilder(ApplicationCommandOptionTypes.String);
    }

    public integer(): ArgumentBuilder<number> {
        return new ArgumentBuilder(ApplicationCommandOptionTypes.Integer);
    }

    public boolean(): ArgumentBuilder<boolean> {
        return new ArgumentBuilder(ApplicationCommandOptionTypes.Boolean);
    }

    public user(): ArgumentBuilder<string> {
        return new ArgumentBuilder(ApplicationCommandOptionTypes.User);
    }

    public channel(): ArgumentBuilder<string> {
        return new ArgumentBuilder(ApplicationCommandOptionTypes.Channel);
    }

    public role(): ArgumentBuilder<string> {
        return new ArgumentBuilder(ApplicationCommandOptionTypes.Role);
    }

    public mentionable(): ArgumentBuilder<string> {
        return new ArgumentBuilder(ApplicationCommandOptionTypes.Mentionable);
    }

    public number(): ArgumentBuilder<number> {
        return new ArgumentBuilder(ApplicationCommandOptionTypes.Number);
    }

    public attachment(): ArgumentBuilder<Attachment> {
        return new ArgumentBuilder(ApplicationCommandOptionTypes.Attachment);
    }

}

export class ArgumentBuilder<ReturnType, Key extends string = string, R extends boolean = false> {

    private _options: ApplicationCommandOption;
    private _parse: ArgumentParseFunction<ReturnType>;
    private _autocomplete?: AutocompleteFunction;

    constructor(type: ApplicationCommandOptionTypes) {
        this._options = {
            required: false,
            type,
        } as ApplicationCommandOption;
        this._parse = (_client, input) => input as ReturnType;
    }

    /*
        Options
    */
    public name<U extends Key>(name: U): ArgumentBuilder<ReturnType, U, R> {
        this._options.name = name;
        return this;
    }

    public description(description: string): this {
        this._options.description = description;
        return this;
    }

    public required(): ArgumentBuilder<ReturnType, Key, true> {
        this._options.required = true;
        return this;
    }

    // TODO add choices
    // TODO add options

    public minValue(value: number): this {
        this._options.minValue = value;
        return this;
    }

    public maxValue(value: number): this {
        this._options.maxValue = value;
        return this;
    }

    public minLength(value: number): this {
        this._options.minLength = value;
        return this;
    }

    public maxLength(value: number): this {
        this._options.maxLength = value;
        return this;
    }

    public autocomplete(autocomplete: AutocompleteFunction): this {
        this._autocomplete = autocomplete;
        this._options.autocomplete = true;
        return this;
    }

    public parser(parser: ArgumentParseFunction<ReturnType>): this {
        this._parse = parser;
        return this;
    }

    private validate(): void {
        if (!this._options.name) {
            throw new Error();
        }
        if (!this._options.type) {
            throw new Error();
        }
        if (!this._options.description) {
            throw new Error();
        }
    }

    public build(): Argument<ReturnType, Key, R> {
        this.validate();

        return new Argument(
            this._options,
            this._parse,
            this._autocomplete
        );
    }

}