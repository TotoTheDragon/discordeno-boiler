export default class DiscordInvalidLength extends Error {
    constructor(field: string, value: string){
        super(`Field ${field} expected a value with a different length. ${value} does not follow those requirements`);
    }
}