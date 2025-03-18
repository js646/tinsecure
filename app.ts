import express, {Application, Request, Response,} from 'express';
import path from 'path';

import { User } from "./models/user";
import { Message } from "./models/message";
import { Report } from "./models/report";

/*  ------- app config --------- */
require('dotenv').config()
const app: Application = express();
const port: string = process.env.PORT|| '443';

const db = require("./db/dbhandler"); //database query handler
const session = require('express-session'); //session management
const bodyParser = require('body-parser'); // middleware
const logger = require("./logger"); //logger
const crypto = require("crypto-js"); //hasher

const handlebars = require('express-handlebars'); //template- und view-engine für dynamisches HTML
app.engine('handlebars', handlebars.engine({ 
    defaultLayout: 'main_layout',
    layoutsDir: 'views/layouts',
    helpers: {
        printMessage: (msg:Message) => { return msg.text.split(':').slice(1).join(':') },
        maximum: (nr1:number, nr2:number):number => {return nr1 >= nr2 ? nr1 : nr2 },
        minimum: (nr1:number, nr2:number):number => {return nr1 < nr2 ? nr1 : nr2 },
    }
}));

app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: false }));

//Declaration-merging für Sessionvariablen
declare module "express-session" {
    interface Session {
        loggedIn: boolean;
        userId: number;
        isAdmin: boolean;
        pass: string;
    }
}
app.use(session({
    secret: "thisismysecretkey12332tinsecure56023xferk",
    saveUninitialized: true,
    resave: false
}))



/*  ------- Endpoints --------- */

//home
app.get(['/','/home'], (req: Request, res: Response) => {
    if(req.session.loggedIn){
        db.getAllUnmatchedUsers(req.session.userId).then((users: User[]) => {
            logger.info(`index-Aufruf von userId: ${req.session.userId} von IP:${req.ip}`);
            res.render('index', {
                user_list: users,
                isAdmin: req.session.isAdmin
            });
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        });
    } else {
        res.redirect("/login");
    }
})

//login
app.get('/login', (req: Request, res: Response) => {
    res.render('login', {layout: 'loginpage_zwischenlösung.handlebars'});
})

//logout
app.get('/logout',(req,res) => {
    if(req.session.loggedIn){
        logger.info(`Logout von userId: ${req.session.userId} von IP:${req.ip}`);
        req.session.destroy((err)=>(console.log(err)));
        res.redirect('/home');
    }
});

//auth
app.post('/auth', (req: Request, res: Response) => {
    let req_email: string = req.body.username;
    let req_password: string = req.body.password;
    logger.warn(`auth-Request mit den Daten: ${req.body.username}:${req.body.password} von IP:${req.ip}`);
    if(req_email && req_password){
        db.all(`SELECT * FROM users WHERE email = '${req_email}' AND password = '${crypto.SHA1(req_password)}'`, (err: Error, rows: any) => {
            if(err) {
                console.log(err);
                logger.error(err.message);
                res.redirect("/login");
            }
            if(rows.length > 0){
                req.session.loggedIn = true;
                req.session.userId = rows[0].uid;
                req.session.isAdmin = req.session.userId == 1 ? true : false;
                req.session.pass = req_password;
                logger.info(`auth-Request mit den Daten: ${req_email}:${req_password} von IP:${req.ip} war erfolgreich, userId=${req.session.userId}`);
                res.redirect('/home');
            } else if(rows.length == 0){
                logger.info(`auth-Request mit den Daten: ${req_email}:${req_password} von IP:${req.ip} fehlgeschlagen`);
                res.redirect("/login");
            }
        });
    } else {
		res.send('Please enter Username and Password!');
		res.end();
	}
}) 

//Registrierungs-Formular anfordern
app.get('/register', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        res.redirect("/home");
    } else {
        res.render("register", {layout: 'loginpage_zwischenlösung.handlebars'});
    }
})

//Account-Registrierung
app.post('/register', (req: Request, res: Response) => {
    logger.info(`Registrierungs-Request mit den Daten: ${req.body.email}:${req.body.password1} von IP:${req.ip}`);
    db.doesEmailExist(req.body.email).then((exists:boolean) => {
        if(exists){
            res.redirect("/acc_exists");
        } else {
            var sex: string = req.body.gender == 'female' ? 'w' : 'm';
            var newUser: User = new User(-1, req.body.lastName, req.body.firstName, req.body.birthdate, req.body.email, req.body.password1, sex, req.body.city, req.body.description, req.body.profilePicture, req.body.secAnswer);
            db.createNewUser(newUser);
            logger.warn(`Neuer Account wurde erstellt! ${newUser.toString()} von IP:${req.ip}`);
            res.redirect('/acc_create_success');
        }
    }).catch((error: Error) => {
        logger.error(error.message);
        res.send(`error: ${error.message}`);
        res.end();
    });
})

//Account-Registrierung: Fehler acc existiert bereits
app.get('/acc_exists', (req: Request, res: Response) => {
    res.render('acc_exists', {layout: 'loginpage_zwischenlösung.handlebars'});
})

//Account-Registrierung: Erfolgreich 
app.get('/acc_create_success', (req: Request, res: Response) => {
    res.render('acc_create_success', {layout: 'loginpage_zwischenlösung.handlebars'});
})

//Passwort wiederherstellung - Seite anfordern
app.get('/recover', (req: Request, res: Response) => {
    res.render("recover", {
        errMsg: false
    });
})

//Passwort wiederherstellung POST
app.post('/recover', (req: Request, res: Response) => {
    db.validateSecurityAnswer(req.body.email, req.body.answer).then((result:boolean) => {
        if(result){
            db.changeUserPassword(req.body.email, req.body.password1);
            res.redirect('/pwchange-success');
        } else {
            res.redirect("recover");
        }
    }).catch((error: Error) => {
        logger.error(error.message);
        res.send(`error: ${error.message}`);
        res.end();
    });
})

//Passwort wiederherstellung fail
app.get('/recover-failed', (req: Request, res: Response) => {
    res.render("recover", {
        errMsg: true
    });
})

//Passwort wiederherstellung erfolgreich
app.get('/pwchange-success', (req: Request, res: Response) => { 
    res.render('pwchange_success');
})


//profil aufrufen
app.get('/profil', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        db.getUserData(req.session.userId).then((user: User) => {
            res.render('profil', {
                uid: user.userid,
                picture: user.picture,
                firstname: user.firstname,
                lastname: user.lastname,
                birthday: user.birthday,
                city: user.city,
                email: user.email,
                description: user.description,
                isMale: user.sex == 'm' ? true : false
            });
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        });
    } else {
        logger.info(`Erfolgloser Profil Aufruf von IP:${req.ip}`);
        res.redirect("/login");
    }
})

//profil: Daten ändern
app.post('/profil', (req: Request, res: Response) => {
    if(req.session.loggedIn && (req.body.password0 == req.body.password1 && req.body.password1 == req.session.pass)){
        logger.warn(`Erfolgreicher Request zur Datenändern von ${req.session.userId} von IP:${req.ip}`);

        var sex: string = req.body.gender == 'female' ? 'w' : 'm';
        var newUserData: User = new User(req.session.userId, req.body.lastName, req.body.firstName, req.body.birthdate, req.body.email, req.body.password1, sex, req.body.city, req.body.description, req.body.profilePicture, "");
        
        logger.info(`Request zur Datenändern von ${req.session.userId} ==  lastName:${req.body.lastName}, firstName:${req.body.firstName}, birthdate:${req.body.birthdate}, email:${req.body.email}, password:${req.body.password1}, sex:${sex}, city:${req.body.city}, description:${req.body.description}, profilePicture:${req.body.profilePicture}`)
        
        db.updateUserData(req.session.userId, newUserData);
        res.redirect('/profil');
    } else {
        logger.warn(`Fehlgeschlagener Request zur Datenändern von ${req.session.userId} von IP:${req.ip}! Eingegebene Passwörter: ${req.body.password0} und ${req.body.password1}`);
        res.redirect('/profil-update-failed');
    }
})

//profil: Daten ändern fehlgeschlagen
app.get('/profil-update-failed', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        logger.info(`Erfolgreicher Profil-update-failed Aufruf von IP:${req.ip}`);
        db.getUserData(req.session.userId).then((user: User) => {
            res.render('profil', {
                uid: user.userid,
                picture: user.picture,
                firstname: user.firstname,
                lastname: user.lastname,
                birthday: user.birthday,
                city: user.city,
                email: user.email,
                description: user.description,
                isMale: user.sex == 'm' ? true : false,
                errMsg: true
            });
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        });
    } else {
        logger.info(`Erfolgloser Profil-update-failed Aufruf von IP:${req.ip}`);
        res.redirect("/login");
    }
})

//match generieren
app.post('/match/:uid',(req: Request, res: Response) => {
    if(req.session.loggedIn){
        db.createMatch(req.session.userId, req.params.uid);
        logger.info(`created match ${req.session.userId}-${req.params.uid} durch ${req.session.userId} von IP:${req.ip}`);
        res.redirect("/home");
    } else {
        logger.info(`Erfolgloser /match/ POST-Request von IP:${req.ip}`);
        res.redirect("/login");
    }
})

//admin-page
app.get('/admin', (req: Request, res: Response) => {
    if(req.session.loggedIn && req.session.isAdmin){
        logger.warn(`Admin-Page wurde - erfolgreich - aufgerufen von IP:${req.ip}`)
        db.getAllUsers().then((users:User[]) => {
            res.render('admin', {
                user_list: users.sort((a:User, b:User) => (a.userid < b.userid) ? -1 : 1)
            });
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        })
    } else {
        logger.warn(`Admin-Page wurde - erfolglos - versucht von IP:${req.ip} aufzurufen`);
        res.redirect("/home");
    }
})

//admin-page: User-Daten ändern
app.post('/admin/changeUserData/:uid', (req: Request, res: Response) => {
    if(req.session.loggedIn && req.session.isAdmin){
        if(db.doesUidExist(req.params.uid)){
            db.getUserData(req.params.uid).then((userData: User) => {
                var newUserData: User = new User(Number(req.params.uid), req.body.lastname, req.body.firstname, req.body.birthdate, req.body.email, userData.password, userData.sex, req.body.city, userData.description, userData.picture, userData.secAnswer);
                db.updateUserData(req.params.uid, newUserData);
                logger.warn(`Admin-Page: Userdaten-Änderung für ${req.params.uid} erfolgreich`);
                res.redirect("/admin");
            }).catch((error: Error) => {
                logger.error(error.message);
                res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
                res.end();
            })
        } else {
            logger.warn(`Admin-Page: Userdaten-Änderung - falscher Parameter übergeben ${req.params.uid}`);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        }
    } else {
        logger.warn(`Admin-Page: Userdaten-Änderung wurde - erfolglos - versucht von IP:${req.ip} aufzurufen`);
        res.redirect("/login");
    }
})

//admin-page: Reports
app.get('/admin/reports', (req: Request, res: Response) => {
    if(req.session.loggedIn && req.session.isAdmin){
        logger.warn(`Admin-Page: Reports wurde - erfolgreich - aufgerufen von IP:${req.ip}`)
        db.getAllReports().then((reports:Report[]) => {
            res.render('admin-reports', {
                reports: reports.sort((a:Report, b:Report) => (a.submitter < b.submitter) ? -1 : 1)
            });
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        })
    } else {
        logger.warn(`Admin-Page: Reports wurde - erfolglos - versucht von IP:${req.ip} aufzurufen`);
        res.redirect("/home");
    }
})

//secret-page
app.get('/secret', (req: Request, res: Response) => {
    logger.warn(`secret-Page aufgerufen von IP:${req.ip}`);
    res.render('secret', {layout: false});
})

//chat-auswahl
app.get('/chats', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        db.getAllMatchedUsers(req.session.userId).then((matches:User[]) => {
            res.render('chat_auswahl', {
                matches: matches,
                req_userid: req.session.userId
            })
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        })
    } else {
        logger.info(`Erfolgloser /chats Aufruf von IP:${req.ip}`);
        res.redirect("/login");
    }
})

//chat-verlauf
app.get('/chat/:uid1-:uid2', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        logger.info(`Chatverlauf ${req.params.uid1}-${req.params.uid2} aufgerufen von userId: ${req.session.userId} von IP:${req.ip}`);
        db.getChatfromUsers(req.params.uid1, req.params.uid2, req.session.userId).then((messages: Message[]) =>{
            res.render('chat', {
                chat: messages,
                uid1: req.params.uid1,
                uid2: req.params.uid2,
                currentUser: req.session.userId,
                otherUser: req.session.userId == Number(req.params.uid1) ? req.params.uid2 : req.params.uid1,
            });
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        })
    } else {
        logger.info(`Erfolgloser /chat/x-x GET-Request von IP:${req.ip}`);
        res.redirect("/login");
    }
})

//chat-verlauf mit report-message
app.get('/chat/:uid1-:uid2/sr', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        logger.info(`Chatverlauf ${req.params.uid1}-${req.params.uid2} aufgerufen von userId: ${req.session.userId} von IP:${req.ip}`);
        db.getChatfromUsers(req.params.uid1, req.params.uid2, req.session.userId).then((messages: Message[]) =>{
            res.render('chat', {
                successfulReportMsg: true,
                chat: messages,
                uid1: req.params.uid1,
                uid2: req.params.uid2,
                currentUser: req.session.userId,
                otherUser: req.session.userId == Number(req.params.uid1) ? req.params.uid2 : req.params.uid1,
            });
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        })
    } else {
        logger.info(`Erfolgloser /chat/x-x GET-Request von IP:${req.ip}`);
        res.redirect("/login");
    }
})

//chat-nachricht abgeschickt
app.post('/chat/:uid1-:uid2', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        
        //Nachricht wurde von Nutzer abgeschickt, der nicht am Chat beteiligt ist
        if(req.session.userId !== Number(req.params.uid1) && req.session.userId !== Number(req.params.uid2)){
            logger.warn(`User:${req.session.userId} hat versucht unberechtigt eine Chat-Nachricht abzuschicken`);
            res.writeHead(302, {
                location: "https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif",
              });
              res.end();
        } else {
            var otherUsersId: number = req.session.userId == Number(req.params.uid1) ? Number(req.params.uid2) : Number(req.params.uid1);
            logger.info(`User:${req.session.userId} hat eine Chat-Nachricht an ${otherUsersId} abgeschickt; Nachricht: ${req.body.message}`);
            db.writeMessageIntoChat(req.body.message, req.session.userId, otherUsersId);
            res.redirect(`/chat/${req.params.uid1}-${req.params.uid2}`);
        }
    } else {
        logger.info(`Erfolgloser /chat/x-x POST-Request von IP:${req.ip}`);
        res.redirect("/login");
    }
})

//report user GET
app.get('/report/:userId', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        db.getUserData(req.params.userId).then((userData: User) => {
            res.render("report", {
                user: userData
            });
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        })
    } else {
        res.redirect("/login");
    }
})

//report user POST
app.post('/report/:userId', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        logger.info(`Report für User ${req.params.userId} von User ${req.session.userId} erstellt`);
        db.createReport(req.params.userId, req.session.userId, req.body.message);
        res.redirect(`/chat/${Math.min(req.session.userId, Number(req.params.userId))}-${Math.max(req.session.userId, Number(req.params.userId))}/sr`);
    } else {
        logger.info(`Erfolgloser Report-Versuch für User ${req.params.userId} von User ${req.session.userId}`);
        res.redirect("/login");
    }
})

//pictures
app.get('/picture/:pictureid', (req: Request, res: Response) => {
    if(req.session.loggedIn){
        logger.info(`Profilbild von User:${req.params.pictureid} wurde von User:${req.session.userId} aufgerufen.`)
        db.getUserData(req.params.pictureid).then((user: User) => {
            res.send(`<img src="${user.picture}">`);
            res.end();
        }).catch((error: Error) => {
            logger.error(error.message);
            res.send(`<img src="https://media.tenor.com/images/3b5dc34e91a8c4d71eff4dcb40f779c7/tenor.gif">`);
            res.end();
        })
    } else {
        logger.info(`Erfolgloser /picture Aufruf von IP:${req.ip}`);
        res.redirect("/login");
    }
})


/* --- public ressources --- */
app.get('/controllers/indexController.js', (req,res) => {
    res.sendFile(path.join(__dirname, 'controllers/indexController.js'));
});


/* --- start server --- */
app.listen(port, () => {
    logger.info(`Server started at port ${port}`);
});