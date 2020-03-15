const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

//set response headers
function setHeaders(response){
    //response.setHeader('Access-Control-Allow-Origin', 'https://my-analytics-3ed6f.firebaseapp.com');
    response.setHeader('Access-Control-Allow-Origin',  'http://localhost:5000');
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
    response.setHeader('Access-Control-Expose-Headers', '*');
}

exports.sessionize = functions.https.onRequest((request, response) => {
    setHeaders(response);
    var cookie = request.headers.cookie;
    if(cookie === undefined){
        const uuidv4 = require("uuid/v4");
        let value = "id="+uuidv4();
        response.setHeader('Content-Type', 'image/png');
        response.setHeader('Set-Cookie', `__session=${value}`);
    }
    response.status(200).send();
});

exports.collect = functions.https.onRequest((request, response) => {
    setHeaders(response);
    let cookie = request.headers.cookie;
    let id = cookie.split("=")[2];

    let time = request.body.split("%%")[0];
    let analyticsData = request.body.split("%%")[1];
    let data = JSON.parse(analyticsData);
    let browsers = data.staticData;
    let speed = data.performanceData;
    browsers['Date-Time'] = time;
    speed['Date-Time'] = time;

    browsers['UserId'] = id;
    speed['UserId'] = id;

    let key = `${id},${time}`

    let browsersDoc = db.collection('browsers').doc(id);
    browsersDoc.set(browsers);
    let speedDoc = db.collection('speed').doc(key);
    speedDoc.set(speed);
    response.status(200).send();
});

exports.processSignUp = functions.auth.user().onCreate((user) => {
    // check if new user meets admin criteria
    if (user.email === undefined || (user.email !== 'pew047@ucsd.edu' && !user.email.endsWith("@cse.135"))) {
        return 1;
    }
    return admin.auth().getUserByEmail(user.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            role: "admin"
        });
    }).then(() => {
        return {
            response: `Success! ${user.email} has ADMIN access.`
        }
    }).catch(err => {
        return err;
    });
});

exports.listUsers = functions.https.onCall((data, context) => {
    if(context.auth.token.role !== "admin"){
        return { error: "Access Denied! Only admin can view users."}
    }
    var users = [];
    return admin.auth().listUsers().then((userRecords) => {
        userRecords.users.forEach((user) => {
            users.push(user);
        });
        return {response: JSON.stringify(users)};
    })
    .catch((err) => {
        console.log(err);
        return { error : "DB Error"}
    });
});

exports.getUser = functions.https.onCall((data, context) => {
    if(context.auth.token.role !== "admin"){
        return { error: "Access Denied! Only admin can view user info."}
    }
    return admin.auth().getUserByEmail(data.email).then(user => {
        return user;
    }).catch(err => {
        return err;
    })
});
exports.changeRole = functions.https.onCall((data, context) => {
    if(context.auth.token.role !== "admin"){
        return { error: "Access Denied! Only admin can change user roles."}
    }
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            role: data.role
        });
    }).then(() => {
        return {
            response: "Success!"
        }
    }).catch(err => {
        return err;
    });
});
exports.deleteUser = functions.https.onCall((data, context) => {
    if(context.auth.token.role !== "admin"){
        return { error: "Access Denied! Only admin can delete user."}
    }
    return admin.auth().deleteUser(data.uid).then(() => {
        return {
            response: "Successfully deleted user"
        }
    })
    .catch((error) => {
        return { error: `'Error deleting user:', ${error}`}
    });
})
exports.browsers = functions.https.onCall((data, context) =>{
    return getFirestoreData(context, 'browsers')
});


exports.speed = functions.https.onCall((data, context) =>{
    return getFirestoreData(context, 'speed');
});

function getFirestoreData(context, collection){
    if(context.auth.token.role !== "analyst" && context.auth.token.role !== "admin"){
        return { error: "Access Denied! Only analysts can view this page."}
    }
    let targetCollection = db.collection(collection);
    let documents = [];
    // get all collections
    return targetCollection.get().then(snapshot => {
        if (snapshot.empty) {
            return { error: "No matching documents."};
        }
        snapshot.forEach(doc => {
            documents.push(doc.data());
        });
        return {response: JSON.stringify(documents)};
    })
    .catch(err => {
        console.log('Error getting documents', err);
        return { error : "DB Error"}
    });
}