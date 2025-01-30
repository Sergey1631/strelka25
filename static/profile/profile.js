function init()
{
  alert(getCookie(''))
  //getUsernameByAccountName(getCookie('accountname')).then(val => document.getElementById('username').innerText = val)
  //document.createElement('input');
}
async function getUsernameByAccountName(accountname){
  let data = JSON.stringify({ 
    cmd: "getUsernameByAccountname",
    accountname:accountname })
  var url = '/profile'
  let response = await fetch(url, {
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
    method: 'POST',
    body: data
  });
  var result = await response.text();
  const parsedResult = JSON.parse(result)
  var name = parsedResult.name;
  return name
}

function getCookie(name) {
  /*
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;*/
  return sessionStorage['accountname']
}


async function editData()
{
    var accountname = document.getElementById('accountname').value;
    var password = document.getElementById('password').value; 
    var url = '/login'
    
    let data = JSON.stringify({ 
      password: password,
      accountname:accountname })
    
    let response = await fetch(url, {
      headers: {
          "Content-Type": "application/json; charset=utf-8",
      },
      method: 'POST',
      body: data
    });
      
    var error = ""
    var result = await response.text();
    try
    {
      const parsedResult = JSON.parse(result)
      error = parsedResult.error;
    }
    catch{

    }
    
    console.log(result)
    
    if (error!=""){
        StaticsLib.setErrorText(error)
    }
    
    if(response.redirected){
        window.location.href = response.url;
    }
}

async function editPhoto()
{
  alert(getCookie(''))
  var photo;
  var input = document.getElementById('photoSelector');
  input.type = 'file';
  
  input.onchange = async e => { 

    var file = e.target.files[0]; 

    photo = file;

    accountname = 'xx'
    const data = new FormData();
    data.append('accountname', accountname);
    data.append('file', file);
    let response = await fetch('/account/editPhoto', {
      method: 'POST',    
      body: data
    })
    filename = await response.text()
    document.getElementById('profilePic').src = '/static/images/profilePics/' + filename
  }
  input.click(); 
}

function loadAccountPhoto(accountname){
  accountname
}