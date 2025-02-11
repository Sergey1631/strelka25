var myMap; // Переменная для хранения созданной карты 

// ----Элементы из html----
var routeNameText; // Ссылка на элемент текста названия маршрута,...
var routeDescriptionText; //... описания маршрута
var routeRatingText; //... рейтинга маршрута
var profileNameText; // элемент текста имени пользователя
var commentField; // элемент поля ввода комментария

var publicRoutes; // переменная для хранения всех публичных маршрутов

var localUser; // переменная для хранения вошедшего пользователя

var currentRouteId = 0; // id выбранного маршрута

ymaps.ready(init);

async function init(){
    routeNameText = document.getElementById("routeName");
    routeDescriptionText = document.getElementById("routeDescription");
    routeRatingText = document.getElementById("routeRating");
    profileNameText = document.getElementById('profileName');
    commentField = document.getElementById('commentField');
    
    user = await pageHelper.getLocalUserInfo();
    if (user.error=='fail') {
        profileNameText.innerText = 'Войти'
    }
    else{
        profileNameText.innerText = user.username
        localUser = user;
    }

    // Создание карты.
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],     
        zoom: 7
    });

    var publicRoutes = await getPublicRoutes();
    var routeList = document.getElementsByClassName('routeList')[0]
    publicRoutes.forEach(route => {
        let btn = document.createElement('button');
        btn.routeId = route.id
        btn.addEventListener('click', onRouteButtonClick)
        btn.innerText = route.name
        routeList.appendChild(btn)
    });
    showRouteInfo(publicRoutes[0].id)

    var referencePoints;
    referencePoints = [
        [55.76, 37.64],
        [55.73, 37.6]
    ]
    //console.log(JSON.stringify(referencePoints))
    //saveRoute()
}

// Функция, чтобы оставить комментарий к маршруту
async function makeComment(){
    var url = '/makeComment'

    let data = JSON.stringify({ 
        route_id: currentRouteId, 
        comment: commentField.value
    })

    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'POST',
        body: data
    });
    var result = await response.text();
    const parsedResult = JSON.parse(result);
    if(parsedResult.error != null){
        alert(parsedResult.error);
    }
    else{
        alert(parsedResult)
    }
}

// Получить информацию о маршруте по его id через GetRoute
// и вывод полученных данных пользователю
async function showRouteInfo(id){
    if(id != currentRouteId){
        route = await getRoute(id);
        var points = JSON.parse(route.points);
        currentRouteId = route.id
        
        var multiRoute = new ymaps.multiRouter.MultiRoute({   
            referencePoints: points
        }, {
            boundsAutoApply: true
        });
        routeNameText.innerText = "Название маршрута: " + route.name
        routeDescriptionText.innerText = "Описание: " + route.description
        routeRatingText.innerText = "Рейтинг: " + route.rating
        myMap.geoObjects.add(multiRoute);

        
    }
}

async function getCommentsForRoute(id){

}

function onRouteButtonClick(event){
    showRouteInfo(event.currentTarget.routeId);
}

function onProfileNameClick(){
    if (localUser){
        toProfile();
    }
    else{
        toAuth();
    }
}

function toProfile(){
    window.location.href = '/profile'; 
}
function toAuth(){
    window.location.href = '/login'; 
}

// Получение маршрута по его id
async function getRoute(id){
    var url = '/getRoute'

    let data = JSON.stringify({ route_id: id })

    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'POST',
        body: data
    });
    var result = await response.text();
    const parsedResult = JSON.parse(result)
    return parsedResult
}

async function getPublicRoutes(){
    var url = '/getPublicRoutes'
    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'GET',
    });
    var result = await response.text();
    const parsedResult = JSON.parse(result)
    return parsedResult
}

async function saveRoute(route){
    let data = JSON.stringify({ 
        route:route })
    var url = '/saveRoute'
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

// Это хуыня для вкладок(основное, комментарии, фотографии), спизженная из интернета.
function showTabContent(evt, tabContent){
    // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabContent).style.display = "block";
  evt.currentTarget.className += " active";
}