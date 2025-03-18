export class User{
    userid: number;
    lastname: string;
    firstname: string;
    birthday: string;
    age: number;
    email: string;
    password: string;
    sex: string;
    city: string;
    description: string;
    picture: string; //url to picture
    secAnswer: string;

    constructor(uid: number, lname: string, fname: string, bday: string, mail: string, pswd: string, sex: string, city: string, desc: string, pic: string, secAnswer:string){
        this.userid = uid;
        this.lastname = lname;
        this.firstname = fname;
        this.birthday = bday;
        this.age = 2022-Number(this.birthday.slice(0, 4));
        this.email = mail;
        this.password = pswd;
        this.sex = sex;
        this.city = city;
        this.description = desc;
        this.picture = pic;
        this.secAnswer = secAnswer;
    }

     toString():string {
        return `user${this.userid}: ${this.firstname} ${this.lastname}`
    }
}