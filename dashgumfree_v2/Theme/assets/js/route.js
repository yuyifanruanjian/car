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