export class Message{
    text: string;
    fromCurrentUser: boolean;

    constructor(text:string, fromCurrentUser:boolean) {
        this.text = text;
        this.fromCurrentUser = fromCurrentUser;
    }
}