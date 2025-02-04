var usernameField // Поле для ввода имени пользователя
var profilePic    // Элемент для отображения фотографии пользователя
var loadedPhoto   // Переменная для загруженного фото

async function init()
{
  usernameField = document.getElementById('username')
  profilePic = document.getElementById('profilePic')

  localUser = await pageHelper.getLocalUserInfo()
  usernameField.innerText = localUser.username

  profilePic.src = "static/images/profilePics/" + localUser.picname
}

async function editProfile()
{
  window.location.href = '/editProfile'; 
}

function redirectToLogin(){
  window.location.href = '/login';
}