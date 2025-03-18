"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(uid, lname, fname, bday, mail, pswd, sex, city, desc, pic, secAnswer) {
        this.userid = uid;
        this.lastname = lname;
        this.firstname = fname;
        this.birthday = bday;
        this.age = 2022 - Number(this.birthday.slice(0, 4));
        this.email = mail;
        this.password = pswd;
        this.sex = sex;
        this.city = city;
        this.description = desc;
        this.picture = pic;
        this.secAnswer = secAnswer;
    }
    toString() {
        return `user${this.userid}: ${this.firstname} ${this.lastname}`;
    }
}
exports.User = User;
