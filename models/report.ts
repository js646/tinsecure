export class Report{
    submitter: number;
    reported: number;
    message: string;

    constructor(submitter: number, reported: number, message: string){
        this.submitter = submitter;
        this.reported = reported;
        this.message = message;
    }

     toString():string {
        return `submitter${this.submitter}: reported ${this.reported} : ${this.message}`
    }
}