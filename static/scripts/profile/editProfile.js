var usernameField // Поле для ввода имени пользователя
var profilePic    // Элемент для отображения фотографии пользователя
var loadedPhoto   // Переменная для загруженного фото

function init()
{
  
  //alert(getCookie(''))
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

async function saveChanges(){
  const data = new FormData();
  data.append('username', usernameField.value);
  
  if (loadedPhoto)
  {
    data.append('photo', loadedPhoto);
    alert(loadedPhoto)
  }
  let response = await fetch('/profile/saveProfileChanges', {
    method: 'POST',    
    body: data
  })
  filename = await response.text()
}

async function editPhoto()
{
  var input = document.getElementById('photoSelector');
  input.type = 'file';
  
  input.onchange = async e => { 

    var file = e.target.files[0]; 
    loadedPhoto = file;
    
    profilePic.src = URL.createObjectURL(loadedPhoto)
  }
  input.click(); 
}

/*
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
}*/