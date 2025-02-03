var usernameField // Поле для ввода имени пользователя
var profilePic    // Элемент для отображения фотографии пользователя
var loadedPhoto   // Переменная для загруженного фото

async function init()
{
  usernameField = document.getElementById('username')
  profilePic = document.getElementById('profilePic')

  localUser = await pageHelper.getLocalUserInfo()
  usernameField.value = localUser.username

  profilePic.src = "static/images/profilePics/" + localUser.picname
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

async function getUserInfoByID(id){
  let data = JSON.stringify({ id:id })
  var url = '/profile/getUserInfoByID'
  let response = await fetch(url, {
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
    method: 'POST',
    body: data
  });
  var result = await response.text();
  const parsedResult = JSON.parse(result)
  //var username = parsedResult.username;
  //var picpath = parsedResult.picpath;
  return parsedResult
}
