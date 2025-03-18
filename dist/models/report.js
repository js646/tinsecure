"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
class Report {
    constructor(submitter, reported, message) {
        this.submitter = submitter;
        this.reported = reported;
        this.message = message;
    }
    toString() {
        return `submitter${this.submitter}: reported ${this.reported} : ${this.message}`;
    }
}
exports.Report = Report;
