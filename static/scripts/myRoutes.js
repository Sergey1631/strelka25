var myMap; // Переменная для хранения созданной карты 

// ----Элементы из html----
var routeNameText; // Ссылка на элемент текста названия маршрута,...
var routeDescriptionText; //... описания маршрута
var routeRatingText; //... рейтинга маршрута
var profileNameText; // элемент текста имени пользователя
var commentField; // элемент поля ввода комментария
var routeList;
var commentsList;
var changesList;
var changesMode;
var pathCoords;

var publicRoutes; // переменная для хранения всех публичных маршрутов

var localUser; // переменная для хранения вошедшего пользователя

var currentRoute;
var currentRouteId = -1;
var mapRoute;
ymaps.ready(init);

async function init(){
    routeNameText = document.getElementById("routeName");
    routeDescriptionText = document.getElementById("routeDescription");
    routeRatingText = document.getElementById("routeRating");
    profileNameText = document.getElementById('profileName');
    commentField = document.getElementById('commentField');
    routeList = document.getElementsByClassName('routeList')[0];
    commentsList = document.getElementsByClassName('commentsList')[0];
    photosList = document.getElementsByClassName('photosList')[0];
    changesList = document.getElementsByClassName('changesList')[0];

    localUser = await pageHelper.getLocalUserInfo();
    pageHelper.initProfileName();

    // Создание карты.
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],     
        zoom: 7
    });

    
    var myRoutes = await getMyRoutes(localUser.id);
    myRoutes.forEach(route => {
        let btn = document.createElement('button');
        btn.routeId = route.id
        btn.addEventListener('click', onRouteButtonClick)
        btn.innerText = route.name
        routeList.appendChild(btn)
    });

    
    pageHelper.showRouteInfo(myRoutes[0]);

    /*
    var referencePoints;
    referencePoints = ['kolosunin.jpg', 'test.jpg']
    
    console.log(JSON.stringify(referencePoints))*/
    //saveRoute()
}

function onRouteButtonClick(event){
    pageHelper.showRouteInfoById(event.currentTarget.routeId);
}

function showRouteChanges(){
    if (changesList!=null) {
        changesList.innerText = ''

        var changes = JSON.parse(currentRoute.changes);
        console.log(changes);
        changes.forEach(change =>{
            let changeElem = document.createElement('p');
            console.log(change.points);
            points = JSON.parse(change.points);
            //commentElem.routeId = route.id
            //commentElem.addEventListener('click', onRouteButtonClick)
            changeElem.innerText = 'Правка от ' + change.date;
            changeElem.points = points;
            changeElem.addEventListener('click', onChangeElementClick);
            changesList.appendChild(changeElem);
        }) 
    }
}

function onChangeElementClick(event){
    pageHelper.buildRouteOnMap(event.currentTarget.points);
    console.log('loadchange')
    
    changesMode = true;
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

async function getMyRoutes(id){
    var url = '/getMyRoutes'
    let data = JSON.stringify({ creator_id: id })
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
    if (changesMode){
        pageHelper.buildRouteOnMap(JSON.parse(route.points));
        changesMode = false;
    }
    if(tabContent=='changes'){
        showRouteChanges();
    }
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