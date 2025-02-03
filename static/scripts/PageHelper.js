var pageHelper = {
  setErrorText: function(text) {
    var errorText = document.getElementById('errorText'); 
    if(errorText != null)
    {
      errorText.innerText = text;
    }
  },

  getLocalUserInfo: async function(){
    var url = '/getLocalUser'
    let response = await fetch(url, {
      headers: {
          "Content-Type": "application/json; charset=utf-8",
      },
      method: 'GET'
    });
    var result = await response.text();
    const parsedResult = JSON.parse(result)
    return parsedResult
  }
}