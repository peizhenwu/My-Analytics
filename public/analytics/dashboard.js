// initialize firebase app
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

// firebase auth 
firebase.auth().onAuthStateChanged( user => {
    if(user){
        user.getIdTokenResult().then(idTokenResult => {
            console.log(idTokenResult.claims);
            user.role = idTokenResult.claims.role;
            displayUI(user);
            if(user.role == "admin"){
                displayAdminUI();
            }
        });  
    }else{
        window.location.href = "login.html";
    }
});

const functions = firebase.functions();

const account = document.getElementById("accountBtn");
const logout = document.getElementById("logoutBtn");
const accountInfo = document.getElementById("accountDialog");
const closeAccount = document.getElementById("closeAccountBtn");

account.addEventListener('click', function(){accountInfo.showModal()});
logout.addEventListener('click', e => {firebase.auth().signOut();});
closeAccount.addEventListener('click', function(){accountInfo.close()});







//////////////////////////////////////////////    Account Info    /////////////////////////////////////////////////////
// account info
function displayUI(user){
    document.getElementById("email").innerText += user.email;
    document.getElementById("creationTime").innerText += user.metadata.creationTime;
    document.getElementById("lastSignin").innerText += user.metadata.lastSignInTime;
    document.getElementById("role").innerText += user.role;
    if(user.role){
        document.getElementById("role").innerText += user.role;
    }else{
        document.getElementById("role").innerText += "user";
    }

    if(user.displayName){
        document.getElementById("name").innerHTML = `<h3>${user.displayName}</h3>`;
    }
    const resetNameBtn = document.querySelector('#name>a');
    const resetPasswordBtn = document.querySelector('#password>a');
    if(resetNameBtn){
        resetNameBtn.addEventListener('click', resetName);
    }
    resetPasswordBtn.addEventListener('click', resetPassword);
}

// update account info
function resetName(){
    document.getElementById("newName").hidden = false;
    document.getElementById("name").hidden = true;
    document.querySelector("#newName>button").addEventListener('click', function(){
        const name = document.querySelector("#newName>input").value;
        firebase.auth().currentUser.updateProfile({
            displayName: name
          }).catch((error) =>{
            console.log("Set Username Error");
        });
        document.getElementById("newName").hidden = true;
        document.getElementById("name").innerHTML = `<h3>${name}</h3>`;
        document.getElementById("name").hidden = false;
    });
}
function resetPassword(){
    document.getElementById("resetPwd").showModal();
    document.getElementById("submitBtn").addEventListener('click', function(){
        const pwd = document.getElementById("pwd").value;
        const pwd2 = document.getElementById("pwd2").value;
        if(!verifyPassword(pwd, pwd2, document.getElementById("errorMsg"))){
            return;
        }else{
            firebase.auth().currentUser.updatePassword(pwd).then(()=>{
                document.getElementById("resetPwd").close();
            }).catch((err)=>{
                document.getElementById("errorMsg").innerText = err.message;
            })
        }
    });
    document.getElementById("cancelBtn").addEventListener('click', function(){
        document.getElementById("resetPwd").close();
    });
}
function verifyPassword(pwd1, pwd2, errorMsg){
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
//////////////////////////////////////////////    User Management    /////////////////////////////////////////////////////
// add "User Management" option
function displayAdminUI(){
    console.log("displaying admin ui");
    const userManage = document.getElementById("userManageBtn");
    userManage.hidden = false;
    userManage.addEventListener('click', manageUsers);
}

// show user grid
function manageUsers(){
    const getUsers = functions.httpsCallable('listUsers');
    getUsers().then(res => {
        showUsers(JSON.parse(res.data.response));
    });
}

function showUsers(data){
    let result = [];
    for(var i=0;i<data.length;i++){
        let user = {};
        user.uid = data[i].uid;
        user.name = data[i].displayName;
        user.email = data[i].email;
        user.role = data[i].customClaims.role;
        result.push(user);
    }
    console.log(JSON.stringify(result));
    document.querySelector("#userManageDiv zg-data").data = JSON.stringify(result);
    document.getElementById("userManageDiv").hidden = false; 
    document.querySelector("#userManageDiv zing-grid").refresh();
}

// edit user
function editUser(event){
    let userEmail = event.parentElement.parentElement.previousSibling.previousSibling.innerText;
    const getUser = functions.httpsCallable('getUser');
    getUser({
        email: userEmail
    }).then(result =>{
        console.log(result.data);
        showUserDialog(result.data);
    })
}

function showUserDialog(user){
    document.querySelector("#userDialog h3").innerText += user.displayName;
    document.getElementById("userEmail").innerText += user.email;
    document.getElementById("userCreationTime").innerText += user.metadata.creationTime;
    document.getElementById("userLastSignin").innerText += user.metadata.lastSignInTime;

    if(user.customClaims.role){
        document.getElementById("userRole").value = user.customClaims.role;
    }else{
        document.getElementById("userRole").value = "user";
    }
    document.getElementById("closeUserBtn").addEventListener('click', (e) => {
        e.preventDefault();
        let role = document.getElementById("userRole").value;
        changeRole(user, role);
        document.getElementById("userDialog").close();
    })
    document.getElementById("userDialog").showModal();
}

function changeRole(user, newRole){
    const change = functions.httpsCallable('changeRole');
    change({
        email: user.email,
        role: newRole
    }).then(result =>{
        console.log(result);
    })
}

function deleteUser(event){
    let userId = event.parentElement.parentElement.parentElement.firstElementChild.innerText;
    const deleteUser = functions.httpsCallable('deleteUser');
    deleteUser({
        uid: userId
    }).then(result => {
        console.log(result);
    })
}

//////////////////////////////////////////////    User Report    /////////////////////////////////////////////////////
const userReportBtn = document.getElementById("userReportBtn");
userReportBtn.addEventListener('click', showUserReport);

function showUserReport(){
    const getBrowsers = functions.httpsCallable('browsers');
    getBrowsers().then(res =>{
        console.log(res);
        if(res.data.error){
            alert(res.data.error);
            return;
        }else if(res.data.response === undefined){
            console.log("Error!");
            return;
        }
        let result = JSON.parse(res.data.response);
        document.querySelector("#userReport zg-data").data = JSON.stringify(result);
        drawCharts(result);
    });
    document.getElementById("menu").hidden = true;
    document.getElementById("userReport").hidden = false;
    document.querySelector("#userReport zing-grid").refresh();
}

function drawCharts(data){
    let browsers = {};
    let os = {};
    let columnData = [];
    // format browser pie chart data
    for(var i=0;i<data.length;i++){
        let ua = data[i].userAgent;
        if(browsers[ua] === undefined){
            browsers[ua] = 1;
        }else{
            browsers[ua] += 1;
        }

        let o = data[i].OS;
        if(os[o] === undefined){
            os[o] = 1;
        }else{
            os[o] += 1;
        }

    }
    let browserPieData = [];
    let browserColumnData = [];
    for (let [key, value] of Object.entries(browsers)) {
        let b = {};
        b.name = key;
        b.y = value/data.length;
        browserPieData.push(b);

        let c = {};
        c.name = key;
        c.data = [value];
        browserColumnData.push(c);

    }
    let osPieData = [];
    for (let [key, value] of Object.entries(os)) {
        let b = {};
        b.name = key;
        b.y = value/data.length;
        osPieData.push(b);
    }

    renderBrowserPieChart(browserPieData);
    renderOSPieChart(osPieData);
    browserColumnData.sort((a,b)=>(a.data[0] > b.data[0])?-1:1);
    let browsersCategories = [];
    let browsersData = [];
    for(var i=0;i<browserColumnData.length;i++){
        browsersCategories.push(browserColumnData[i].name);
        browsersData.push(browserColumnData[i].data);
    }
    renderBrowserColumnChart(browsersCategories,browsersData);

}
function renderBrowserPieChart(chartData){
    Highcharts.chart('browserPieChart', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Browser Distribution'
        },
        tooltip: {
            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Browser',
            colorByPoint: true,
            data: chartData
        }]
    });
}
function renderOSPieChart(chartData){
    Highcharts.chart('osPieChart', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Operating System Distribution'
        },
        tooltip: {
            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Operating System',
            colorByPoint: true,
            data: chartData
        }]
    });
}
function renderBrowserColumnChart(browsersCategories,browsersData){
    Highcharts.chart('browserColumnChart', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Browsers'
        },
        xAxis: {
            categories: browsersCategories,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Users'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Browsers',
            data: browsersData
    
        }]
    });
}
//////////////////////////////////////////////    Performance Report    /////////////////////////////////////////////////////
const performanceReportBtn = document.getElementById("performanceReportBtn");
performanceReportBtn.addEventListener('click', showPerformanceReport);

function showPerformanceReport(){
    
}