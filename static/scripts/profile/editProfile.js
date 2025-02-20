var usernameField // Поле для ввода имени пользователя
var profilePic    // Элемент для отображения фотографии пользователя
var loadedPhoto   // Переменная для загруженного фото

var localUser;
async function init()
{
  // Получаем данные о локальном пользователе 
  // (пользователе который сейчас вошёл в свой аккаунт)
  localUser = await pageHelper.getLocalUserInfo();
  pageHelper.initProfileName();

  usernameField = document.getElementById('username')
  profilePic = document.getElementById('profilePic')

  
  // Получаем имя пользователя и записываем его в поле ввода имени
  usernameField.value = localUser.username

  // Получаем имя файла аватарки пользователя и указываем путь к нему
  profilePic.src = "static/images/profilePics/" + localUser.picname
}

// Функция для сохранения изменённых данных о пользователе
async function saveChanges(){
  
  // Обычно при передаче данных из браузера использовался json
  // Но здесь используется FormData т.к. в json нельзя так легко передавать файлы
  // (в нашем случае аватарку пользователя)
  const data = new FormData();
  data.append('username', usernameField.value);
  
  // Если пользователь загрузил новое фото, то записываем в тело запроса ещё и фото
  if (loadedPhoto)
  {
    data.append('photo', loadedPhoto);
  }
  let response = await fetch('/profile/saveProfileChanges', {
    method: 'POST',    
    body: data
  })
}
async function redirectToProfile(){
  window.location.href = '/profile'
}
// Функция для загрузки новой фотографии
async function editPhoto()
{
  // Получаем ссылку на элемент загрузки фото (<input type="file">) из html
  var input = document.getElementById('photoSelector');
  input.type = 'file';
  
  // onchange - event вызываемый, если в input будет загружен какой либо файл
  // Добавляем в onchange обработку выбранного фото 
  input.onchange = async e => { 

    var file = e.target.files[0]; 
    loadedPhoto = file;
    
    // Показываем выбранное фото в элементе для отображения аватарки
    profilePic.src = URL.createObjectURL(loadedPhoto)
  }

  // Принудительно вызываем процесс выбора фотографии в элементе для выбора файлов
  // Так как изначально <input type="file"> из html работает самостоятельно, но
  // выглядит не так как надо, поэтому мы вручную вызываем click() по нему чтобы 
  // начать процесс выбора файла
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
