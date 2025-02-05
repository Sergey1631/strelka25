async function signup()
{
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value; 
    var username = document.getElementById('username').value; 

    // Формируем тело запроса в формате JSON
    let data = JSON.stringify({ 
        email: email,
        password: password,
        username:username})

    // route к которому будем отправлять POST-запрос (@app.route('/signUp') в python)
    var url = '/signup'  
    
    // Отправляем POST-запрос на указанный выше url 
    let response = await fetch('/signup', {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'POST',
        body: data
    });
        
    var error = ""
    var result = await response.text();
    
    try{
        const parsedResult = JSON.parse(result)
    error = parsedResult.error;
    }
    catch{

    }
    
    // Если в ответе есть адрес для переадресации, 
    // то переадресовываем на адрес из ответа
    // если же переадресации нет и в ответе поле ошибки не пустое
    // значит выводим эту ошибку через pageHelper
    if(response.redirected){
        window.location.href = response.url;
    }
    else if (error!=""){
        pageHelper.setErrorText(error)
    }
}