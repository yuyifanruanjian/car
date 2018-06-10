function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

function goToIndex() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "index.html?token="+token+"&id="+id;
}

function goToMyPhoto() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "myphoto.html?token="+token+"&id="+id;
}

function goToMyQuestion() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "myquestion.html?token="+token+"&id="+id;
}

function goToMyBook() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "mybook.html?token="+token+"&id="+id;
}

function goToMyArbitration() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "myarbitration.html?token="+token+"&id="+id;
}

function goToSubmitPhoto() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "submit_img.html?token="+token+"&id="+id;
}

function goToImgList() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "imglist.html?token="+token+"&id="+id;
}

function goToSubmitBook() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "submit_book.html?token="+token+"&id="+id;
}

function goToBookList() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "booklist.html?token="+token+"&id="+id;
}

function goToSubmitProblem() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "submit_problem.html?token="+token+"&id="+id;
}

function goToProblemList() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "problemlist.html?token="+token+"&id="+id;
}

function goToProblem(problemId) {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "problem.html?token="+token+"&id="+id+"&pid="+problemId;
}

function goToSubmitArbitration() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "submit_arbitration.html?token="+token+"&id="+id;
}

function goToArbitrationList() {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "arbitrationlist.html?token="+token+"&id="+id;
}

function goToArbitration(arbitrationId) {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "arbitration.html?token="+token+"&id="+id+"&aid="+arbitrationId;
}

function goToCar(carId) {
    var req = GetRequest();
    var token = req['token'];
    var id = req['id'];
    window.location.href = "car.html?token="+token+"&id="+id+"&cid="+carId;
}