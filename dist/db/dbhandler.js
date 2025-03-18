"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const message_1 = require("../models/message");
const report_1 = require("../models/report");
const fs_1 = __importDefault(require("fs"));
/*  --------
    Datenbank-Initialisierung:
    der Code wird beim Start der App ausgeführt
-------- */
const sqlite3 = require("sqlite3").verbose(); //sqlite3
const logger = require("../logger"); //logger
const crypto = require("crypto-js");
const db = new sqlite3.Database('./db/database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        logger.error(err.message);
    else
        logger.info('db connection successful');
});
db.serialize(() => {
    //create tables
    db.run('CREATE TABLE IF NOT EXISTS users(uid integer PRIMARY KEY AUTOINCREMENT, lastname, firstname, birthday, email, password, sex, city, description, picture, secAnswer)')
        .run('CREATE TABLE IF NOT EXISTS matches(match_id integer PRIMARY KEY AUTOINCREMENT, uid1, uid2, chat_file)')
        .run('CREATE TABLE IF NOT EXISTS reports(report_id integer PRIMARY KEY AUTOINCREMENT, submitterUid, reportedUid, message)');
    //insert data
    db.run(`INSERT INTO users(lastname, firstname, birthday, email, password, sex, city, description, picture, secAnswer)
            VALUES
            ('admin', 'admin', '2000-01-01', 'admin@t.insecure', '${crypto.SHA1('1q2w3e')}', 'm', 'Berlin', 'I love to develop insecure Dating-Apps :)', 'https://logodix.com/logo/1707094.png', 'surely not tinsecure'),
            ('test', 'test', '2005-05-12', 'test', '${crypto.SHA1('test')}', 'w', 'test', 'test', 'https://i.vimeocdn.com/portrait/58832_300x300.jpg', 'test'),
            ('Bezos', 'Jeff', '1964-01-12', 'ceo@amazon.com', '${crypto.SHA1('urbrokehaha')}', 'm', 'Los Angeles', 'I can buy the world', 'https://echolakay.info/wp-content/uploads/2020/07/Jeff-Bezos-gagne-13-milliards-de-dollars-en-une-journ%C3%A9e.jpeg', 'amazon'),
            ('Fawkes', 'Guy ', '0685-01-01', 'anonymous', '${crypto.SHA1('anonymous')}', 'm', 'anonymous', 'Expect us.', 'https://fotos.perfil.com/2020/06/01/trim/1200/900/anonymous-965108.jpg', 'freedom of speech'),
            ('Garfield', 'Andrew', '1983-20-08', 'AndrewG@hotmail.com', '${crypto.SHA1('Spiderman12')}', 'm', 'Los Angeles', 'your friendly neighborhood spider man', 'https://crops.giga.de/b7/0c/4f/a01cc0133f314cb2c2b0214608_YyA1NjkzeDMyMDIrMTgyKzEyMwJyZSA4NDAgNDcyA2JjYWMxZjQyYjEw.jpg', 'Gwen Stacy'),
            ('Downey jr.', 'Robert', '1965-04-04', 'RobertDjr@gmail.com', '${crypto.SHA1('Iron man 123')}', 'm', 'New York', 'I am Iron man', 'https://media.gq-magazin.de/photos/60a4de637986d15b5045a018/master/pass/robert-downey-jr-star-wars.jpg', 'Jericho'),
            ('Ronaldo', 'Cristiano', '1985-02-05', 'Cr7@hotmail.com', '${crypto.SHA1('Chris7')}', 'm', 'Manchester', 'Suiiiiiiiii', 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg', 'ballon dor'),
            ('Jenner', 'Kylie', '1997-10-10', 'Kylie.Jenner@hotmail.com', '${crypto.SHA1('iamstoopid')}', 'w', 'Los Angeles', 'nobody looks better than me', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Kylie_Jenner_in_2021.jpg/220px-Kylie_Jenner_in_2021.jpg', 'Travis Scott'),
            ('Rhoades', 'Lana', '1996-09-06', 'Lana.Rhoades@pornhub.com', '${crypto.SHA1('lana69')}', 'w', 'Illinois', 'Stepbro im stuck', 'https://i1.sndcdn.com/artworks-c0pAqjWkHLHYHfD4-L2n7rg-t500x500.jpg', 'bbc'),
            ('Beer', 'Madison', '1999-03-05', 'Madison.Beer99@hotmail.com', '${crypto.SHA1('MadiB99')}', 'w', 'San Francisco', 'My life is between music and my dog coco', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Madison_Beer_2019_by_Glenn_Francis_%28cropped%29.jpg/1200px-Madison_Beer_2019_by_Glenn_Francis_%28cropped%29.jpg', 'coco'),
            ('Hart', 'Kevin', '1979-06-06', 'KevinH79@hotmail.com', '${crypto.SHA1('KEVINhart42')}', 'm', 'Philadelphia', 'Comedy is the key to happines', 'https://images-na.ssl-images-amazon.com/images/S/amzn-author-media-prod/4237evohdno3t2rsouqb5med7r._SX450_.jpg', 'comedy'),
            ('Johnson', 'Dwayne', '1972-05-02', 'TheRock@gmail.com', '${crypto.SHA1('DwayneTheRockJohnson10')}', 'm', 'California', 'No Pain No Gain', 'https://cdn.unitycms.io/image/ocroped/1200,1200,1000,1000,0,0/IQZXy2NSsYU/7Vy9DXSxavVBdzQet3_rB-.jpg', 'muscle'),
            ('Gomez', 'Selena', '1992-07-22', 'Selena.Gomez@gmail.com', '${crypto.SHA1('SeliG12')}', 'w', 'Texas', ' just living my live - i love pancakes', 'https://upload.wikimedia.org/wikipedia/commons/3/3c/191125_Selena_Gomez_at_the_2019_American_Music_Awards.png', 'pancakes')
            `);
    db.run(`INSERT INTO matches(uid1, uid2, chat_file)
            VALUES
            (1, 2, 'chats/chat_1-2'),
            (3, 4, 'chats/chat_3-4'),
            (5, 10, 'chats/chat_5-10'),
            (12, 7, 'chats/chat_3-4'),
            (1, 2, 'chats/chat_1-2'),
            (3, 4, 'chats/chat_3-4')
            `);
    db.run(`INSERT INTO reports(submitterUid, reportedUid, message)
    VALUES
    (2, 3, 'he steals all my data'),
    (3, 4, 'he tried to hack me')
    `);
});
/* ---- Exports ---- */
module.exports = db;
module.exports.createMatch = function (uid1, uid2) {
    fs_1.default.stat(`./chats/chat_${uid1}-${uid2}`, function (err, stat) {
        if (err == null) {
            // file already exists
            return;
        }
        else if (err.code === 'ENOENT') {
            // file does not exist => create it
            fs_1.default.open(`./chats/chat_${uid1}-${uid2}`, "wx", function (err, fd) {
                if (err)
                    logger.error(err.message);
                fs_1.default.close(fd, function (err) {
                    if (err)
                        logger.error(err.message);
                });
            });
        }
        else {
            logger.error(`DB: Cant create Match ${uid1}-${uid2}`);
            return;
        }
    });
    db.run(`INSERT INTO matches(uid1, uid2, chat_file) VALUES (${Math.min(uid1, uid2)}, ${Math.max(uid1, uid2)}, 'chats/chat_${uid1}-${uid2}')`);
};
module.exports.createReport = function (submitterUid, reportedUid, message) {
    logger.info("DB: Neuer report erstellt");
    db.run(`INSERT INTO reports(submitterUid, reportedUid, message) VALUES (${submitterUid}, ${reportedUid}, '${message}')`);
};
module.exports.getUserData = function (uid) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE uid=${uid}`, (err, row) => {
            if (err) {
                logger.error(`DB: Cant get User-Data from ${uid} - err: ${err.message}`);
                return reject(err);
            }
            if (row && row.uid) {
                resolve(new user_1.User(row.uid, row.lastname, row.firstname, row.birthday, row.email, row.password, row.sex, row.city, row.description, row.picture, row.secAnswer));
            }
            else {
                reject({});
            }
        });
    });
};
module.exports.createNewUser = function (userData) {
    db.run(`INSERT INTO users(lastname, firstname, birthday, email, password, sex, city, description, picture, secAnswer)
            VALUES
            ('${userData.lastname}', '${userData.firstname}', '${userData.birthday}', '${userData.email}', '${crypto.SHA1(userData.password)}', '${userData.sex}', '${userData.city}', '${userData.description}', '${userData.picture}', '${userData.secAnswer}')`);
};
module.exports.updateUserData = function (uid, userData) {
    db.run("UPDATE users SET lastname = $lname, firstname = $fname, birthday = $bday, email = $email, password = $pw, sex = $sex, city = $city, description = $desc, picture = $pic WHERE uid = $uid", {
        $uid: uid,
        $lname: userData.lastname,
        $fname: userData.firstname,
        $bday: userData.birthday,
        $email: userData.email,
        $pw: crypto.SHA1(userData.password),
        $sex: userData.sex,
        $city: userData.city,
        $desc: userData.description,
        $pic: userData.picture
    });
};
module.exports.changeUserPassword = function (email, password) {
    db.run(`UPDATE users SET password = $pw WHERE email=$email`, {
        $pw: crypto.SHA1(password),
        $email: email
    });
};
module.exports.validateSecurityAnswer = function (email, answer) {
    return new Promise((resolve, reject) => {
        doesEmailExist(email).then((res) => {
            if (res) {
                db.get(`SELECT * FROM users WHERE email = $email`, { $email: email }, (err, row) => {
                    if (err) {
                        logger.error(`DB: validateSecruityAnser: Cant get User-Data from ${email} - err: ${err.message}`);
                        reject(false);
                    }
                    if (row && row.uid) {
                        resolve(row.secAnswer == answer ? true : false);
                    }
                    else {
                        resolve(false);
                    }
                });
            }
            else {
                resolve(false);
            }
        });
    });
};
module.exports.doesEmailExist = doesEmailExist;
function doesEmailExist(email) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users WHERE email = $email`, { $email: email }, (err, rows) => {
            if (err) {
                logger.error(`DB: doesEmailExist - err:${err.message}`);
                reject(err);
            }
            if (rows[0]) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}
module.exports.doesUidExist = doesUidExist;
function doesUidExist(uid) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users WHERE uid = $uid`, { $uid: uid }, (err, rows) => {
            if (err) {
                logger.error(`DB: doesUidExist - err:${err.message}`);
                reject(err);
            }
            if (rows[0]) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}
module.exports.getAllUsers = function () {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users`, (err, rows) => {
            if (err) {
                logger.error(`DB: Cant retrieve User-Data (all) - err:${err.message}`);
                reject(err);
            }
            let users = [];
            for (var row in rows) {
                users.push(new user_1.User(rows[row].uid, rows[row].lastname, rows[row].firstname, rows[row].birthday, rows[row].email, rows[row].password, rows[row].sex, rows[row].city, rows[row].description, rows[row].picture, rows[row].secAnswer));
            }
            shuffleArray(users);
            resolve(users);
        });
    });
};
module.exports.getAllReports = function () {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM reports`, (err, rows) => {
            if (err) {
                logger.error(`DB: Cant retrieve Report-Data (all) - err:${err.message}`);
                reject(err);
            }
            let reports = [];
            for (var row in rows) { //submitterUid, reportedUid, message
                reports.push(new report_1.Report(rows[row].submitterUid, rows[row].reportedUid, rows[row].message));
            }
            resolve(reports);
        });
    });
};
module.exports.getAllUnmatchedUsers = function (uid) {
    return new Promise((resolve, reject) => {
        getUidsfromUserMatches(uid).then((uids) => {
            //query zusammenbauen
            var query_str = "";
            for (var i = 0; i < uids.length; i++) {
                query_str += `${uids[i]}`;
                if (i != uids.length - 1) {
                    query_str += ',';
                }
            }
            //Daten der Nutzer abfragen
            db.all(`SELECT * FROM users WHERE uid NOT IN (${query_str})`, (err, rows) => {
                if (err) {
                    logger.error(`DB: Cant getAllUnmatchedUsers - err:${err.message}`);
                    reject(err);
                }
                var unmatched_users = [];
                for (var row in rows) {
                    if (rows[row].uid == uid)
                        continue;
                    unmatched_users.push(new user_1.User(rows[row].uid, rows[row].lastname, rows[row].firstname, rows[row].birthday, rows[row].email, rows[row].password, rows[row].sex, rows[row].city, rows[row].description, rows[row].picture, rows[row].secAnswer));
                }
                resolve(unmatched_users);
            });
        });
    });
};
module.exports.getAllMatchedUsers = function (uid) {
    return new Promise((resolve, reject) => {
        getUidsfromUserMatches(uid).then((uids) => {
            //query zusammenbauen
            var query_str = "";
            for (var i = 0; i < uids.length; i++) {
                query_str += `${uids[i]}`;
                if (i != uids.length - 1) {
                    query_str += ',';
                }
            }
            //Daten der Nutzer abfragen
            db.all(`SELECT * FROM users WHERE uid IN (${query_str})`, (err, rows) => {
                if (err) {
                    logger.error(`DB: Cant getAllMatchedUsers - err:${err.message}`);
                    reject(err);
                }
                var matched_users = [];
                for (var row in rows) {
                    if (rows[row].uid == uid)
                        continue;
                    matched_users.push(new user_1.User(rows[row].uid, rows[row].lastname, rows[row].firstname, rows[row].birthday, rows[row].email, rows[row].password, rows[row].sex, rows[row].city, rows[row].description, rows[row].picture, rows[row].secAnswer));
                }
                resolve(matched_users);
            });
        });
    });
};
module.exports.getUidsfromUserMatches = getUidsfromUserMatches;
function getUidsfromUserMatches(uid) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM matches WHERE uid1=${uid} OR uid2=${uid}`, (err, rows) => {
            if (err) {
                logger.error(`DB: Matches für ${uid} konnten nicht geladen werden - err:${err.message}`);
                return reject(err);
            }
            //uids der gematchten Personen abfragen
            var match_uids = [];
            rows.forEach((row) => {
                match_uids.push(row.uid1 == uid ? row.uid2 : row.uid1);
            });
            resolve(match_uids);
        });
    });
}
module.exports.getChatfromUsers = function (uid1, uid2, actualUserId) {
    return new Promise((resolve, reject) => {
        //Dateipfad zum Chat
        var file = `chats/chat_${uid1}-${uid2}`;
        //Zeilen aus Text-Datei lesen und in einem Array von Messages speichern
        fs_1.default.readFile(file, 'utf8', (err, data) => {
            var msgs = [];
            if (err) {
                logger.error(`DB: Chat-Datei von ${uid1}-${uid2} konnte nicht geöffnet werden ${err.message}`);
                resolve(msgs);
            }
            else {
                const lines = data.split(/\r?\n/);
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].length > 0) {
                        var fromCurrentUser;
                        var senderId = Number(lines[i].slice(0, 1));
                        if (actualUserId != uid1 && actualUserId != uid2) {
                            if (senderId == uid1) {
                                msgs.push(new message_1.Message(lines[i], true));
                            }
                            else {
                                msgs.push(new message_1.Message(lines[i], false));
                            }
                        }
                        else {
                            fromCurrentUser = senderId == actualUserId ? true : false;
                            msgs.push(new message_1.Message(lines[i], fromCurrentUser));
                        }
                    }
                }
                resolve(msgs);
            }
        });
    });
};
module.exports.writeMessageIntoChat = function (message, senderId, otherUsersId) {
    var msg = senderId + ":" + message + "\r\n";
    var biggerUid = Math.max(senderId, otherUsersId);
    var smallerUid = Math.min(senderId, otherUsersId);
    const writeSteam = fs_1.default.createWriteStream(`chats/chat_${smallerUid}-${biggerUid}`, {
        flags: 'a' //flags: 'a' preserved old data
    });
    writeSteam.write(msg);
    writeSteam.close();
};
module.exports.closeDbConnection = () => {
    db.close((err) => {
        if (err)
            return logger.error(err.message);
        else
            return logger.info('db connection closed');
    });
};
/* --- Hilfsmethoden -- */
/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
