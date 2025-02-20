var usernameField; // Поле для ввода имени пользователя
var profilePic;    // Элемент для отображения фотографии пользователя
var localUser;
async function init()
{
  usernameField = document.getElementById('username')
  profilePic = document.getElementById('profilePic')

  localUser = await pageHelper.getLocalUserInfo();
  pageHelper.initProfileName()

  usernameField.innerText = localUser.username

  profilePic.src = "static/images/profilePics/" + localUser.picname
}

async function logOut(){
  var url = '/logout' 
    
  // Формируем тело запроса в формате JSON
  let data = JSON.stringify({  })

  // Отправляем POST-запрос на указанный выше url
  let response = await fetch(url, {
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
    method: 'POST',
    body: data
  });
    
  // Если в ответе есть адрес для переадресации, 
  // то переадресовываем на адрес из ответа
  // если же переадресации нет и в ответе поле ошибки не пустое
  // значит выводим эту ошибку через pageHelper
  if(response.redirected){
    window.location.href = response.url;
  }
  else
  {
    var error = ""

    // Получаем ответ на запрос
    var result = await response.text();
    const parsedResult = JSON.parse(result)
    error = parsedResult.error;

    
    pageHelper.setErrorText(error)
  } 
}

async function editProfile()
{
  window.location.href = '/editProfile'; 
}

async function myRoutes()
{
  window.location.href = '/myRoutes'; 
}

function redirectToLogin(){
  window.location.href = '/login';
}
