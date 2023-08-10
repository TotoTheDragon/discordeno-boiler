import { KeyValueMap } from "#service/structure/typeUtil.js";
import { Interaction } from "@discordeno/bot";

export default class ButtonContext<PathParameters extends KeyValueMap> {
    
    private readonly _pathParameters: Map<string, string>;
    readonly interaction: Interaction;
    arguments!: PathParameters;

    constructor(interaction: Interaction, args: Map<string, string>){
        this.interaction = interaction;
        this._pathParameters =args;
    }

    async parseArguments(): Promise<void> {
        this.arguments = Object.fromEntries(this._pathParameters) as PathParameters;
    }
}