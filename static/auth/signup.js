async function signup()
{
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value; 
    var username = document.getElementById('username').value; 
    var accountname = document.getElementById('accountname').value; 
        
    let data = JSON.stringify({ 
        email: email,
        password: password,
        username:username,
        accountname:accountname })
    var url = '/signup'
    
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