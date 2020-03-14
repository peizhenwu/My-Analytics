const firebaseConfig = {
    apiKey: "AIzaSyDe4UGDmnPk5n-A19ogUC2Df8-ONTFq9fQ",
    authDomain: "my-analytics-3ed6f.firebaseapp.com",
    databaseURL: "https://my-analytics-3ed6f.firebaseio.com",
    projectId: "my-analytics-3ed6f",
    storageBucket: "my-analytics-3ed6f.appspot.com",
    messagingSenderId: "873862499061",
    appId: "1:873862499061:web:4989782c46e0f19174d3bc"
  };
firebase.initializeApp(firebaseConfig);

const email = document.getElementById("email");
const password = document.getElementById("password");
const login = document.getElementById("loginBtn");
const signUpDialog = document.getElementById("signUpDialogBtn");
const loginErrorMsg = document.getElementById("loginErrorMsg");

const signUpEmail = document.getElementById("signUpEmail");
const signUpPwd = document.getElementById("signUpPwd");
const signUpPwd2 = document.getElementById("signUpPwd2");
const errorMsg = document.getElementById("signupErrorMsg");
const signUp = document.getElementById("signUpBtn");
const cancel = document.getElementById("cancelBtn");

login.addEventListener('click', onLogin);
signUpDialog.addEventListener('click', openSignUpDialog);

firebase.auth().onAuthStateChanged( user => {
    if(user){
        console.log(user);
        window.location.href = "dashboard.html";
    } else{
        console.log('user not logged in');
    }
});
function onLogin(e){
    const emailVal = email.value;
    const pwdVal = password.value;
    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(emailVal, pwdVal);
    promise.catch(e => loginErrorMsg.innerText = e.message);
}
function openSignUpDialog(){
    const dialog = document.getElementById('signUp');
    dialog.showModal();
    signUp.addEventListener('click', onSignUp);
    cancel.addEventListener('click', function(){dialog.close()});
}
function onSignUp(e){
    const emailVal = signUpEmail.value;
    const pwd1 = signUpPwd.value;
    const pwd2 = signUpPwd2.value;
    if(!verifyPassword(pwd1, pwd2)){
        return false;
    }
    // create a new user account
    const promise = firebase.auth().createUserWithEmailAndPassword(emailVal, pwd1);
    promise.catch(e => errorMsg.innerText = e.message);
}

function verifyPassword(pwd1, pwd2)
  {
    if(pwd1 != pwd2){
        errorMsg.innerText = "Error: Please confirm your password!";
        return false;
    }
    re = /[0-9]/;
    if(!re.test(pwd1)) {
        errorMsg.innerText = "Error: Password must contain at least one number (0-9)!";
        return false;
    }
    re = /[a-z]/;
    if(!re.test(pwd1)) {
        errorMsg.innerText = "Error: password must contain at least one lowercase letter (a-z)!";
        return false;
    }
    re = /[A-Z]/;
    if(!re.test(pwd1)) {
        errorMsg.innerText = "Error: password must contain at least one uppercase letter (A-Z)!";
        return false;
    }
    return true;
  }