async function login()
{
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value; 
    
    // route к которому будем отправлять POST-запрос (@app.route('/login') в python)
    var url = '/login' 
    
    // Формируем тело запроса в формате JSON
    let data = JSON.stringify({ 
      password: password,
      email:email })

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

      // Получаем ответ на запрос
      var result = await response.text();
      const parsedResult = JSON.parse(result)
      var error = parsedResult.error;

      
      pageHelper.setErrorText(error)
    } 
}

// Функция для переадресации на страницу регистрации
function redirectToSignup(){
  signUpPath = "/signup"
  window.location.replace(signUpPath)
}