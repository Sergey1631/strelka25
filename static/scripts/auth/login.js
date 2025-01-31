async function login()
{
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value; 
    var url = '/login'
    
    let data = JSON.stringify({ 
      password: password,
      email:email })
    
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
        PageHelper.setErrorText(error)
    }
    
    if(response.redirected){
        window.location.href = response.url;
    }
}
function redirectToSignup(){
  signUpPath = "/signup"
  window.location.replace(signUpPath)
}