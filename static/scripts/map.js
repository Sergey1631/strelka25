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


var publicRoutes;// переменная для хранения всех публичных маршрутов

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
    }), objectManager = new ymaps.ObjectManager();

    
    var publicRoutes = await getPublicRoutes();
    publicRoutes.forEach(route => {
        let btn = document.createElement('button');
        btn.routeId = route.id
        btn.addEventListener('click', onRouteButtonClick)
        btn.innerText = route.name
        routeList.appendChild(btn)
    });
    showRouteInfo(publicRoutes[0].id)

    /*
    var referencePoints;
    referencePoints = ['kolosunin.jpg', 'test.jpg']
    
    console.log(JSON.stringify(referencePoints))*/
    //saveRoute()
}

// Функция, чтобы оставить комментарий к маршруту
async function makeComment(){
    var url = '/makeComment'

    let data = JSON.stringify({ 
        route_id: currentRoute.id, 
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

function buildRouteOnMap(points){
   pageHelper.buildRouteOnMap(points)
}

// Получить информацию о маршруте по его id через getRoute
// и вывод полученных данных пользователю
async function showRouteInfo(id){
    if(id != currentRouteId){
        route = await getRoute(id);
        var points = JSON.parse(route.points);
        var photos = JSON.parse(route.photos);
        var changes = JSON.parse(route.changes);
        currentRoute = route;
        buildRouteOnMap(points);
        routeNameText.innerText = "Название маршрута: " + route.name
        routeDescriptionText.innerText = "Описание: " + route.description
        routeRatingText.innerText = "Рейтинг: " + route.rating
        
        commentsList.innerText = ''
        route.comments.forEach(comment => {
            let commentElem = document.createElement('div');
            commentElem.style.border = '1px solid #ccc';

            let commentCreatorElem = document.createElement('p');
            commentCreatorElem.style.marginTop = '5px'
            commentCreatorElem.style.marginBottom = '0px'
            commentCreatorElem.style.fontSize = '18px'

            let commentTextElem = document.createElement('p');
            commentElem.appendChild(commentCreatorElem);

            commentElem.appendChild(commentTextElem);
            commentTextElem.innerText = comment.comment;
            commentCreatorElem.innerText = comment.creator;
            commentsList.appendChild(commentElem);
        })
        
        photosList.innerText = ''
        photos.forEach(photo => {
            let photoElem = document.createElement('img');
            photoElem.src = "static/images/routes/" + photo;
            photoElem.style.height = '100px';
            photoElem.style.weight = '100px';

            photosList.appendChild(photoElem);

            let photoElem2 = document.createElement('img');
            photoElem2.src = "static/images/routes/" + photo;
            photoElem2.style.height = '100px';
            photoElem2.style.weight = '100px';

            photosList.appendChild(photoElem2);
        })
        
        changesList.innerText = ''

        changes.forEach(change =>{
            let changeElem = document.createElement('p');
            //commentElem.routeId = route.id
            //commentElem.addEventListener('click', onRouteButtonClick)
            changeElem.innerText = change.date;
            changeElem.points = points;
            changeElem.addEventListener('click', onChangeElementClick);
            changesList.appendChild(changeElem);
        })  
    }
}

async function getCommentsForRoute(id){

}

function onRouteButtonClick(event){
    showRouteInfo(event.currentTarget.routeId);
}

function onChangeElementClick(event){
    buildRouteOnMap(event.currentTarget.points);
    changesMode = true;
}

function onProfileNameClick(){
    if (localUser){
        toProfile();
    }
    else{
        toAuth();
    }
}

async function exportRoute(type){
    var url = '/export'

    let data = JSON.stringify({ 
        id: currentRoute.id,
        points: pathCoords, 
        export_type: type
    })
    //console.log(data)

    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'POST',
        body: data
    });
    var result = await response.text();

    exporturi = '/static/exports/' + type + "/" + result;
    pageHelper.downloadURI(exporturi, type + '_export')
    
    /*console.log()
    const parsedResult = JSON.parse(result);*/
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

async function importObjects(){
    var input = document.getElementById('importSelector');
    input.type = 'file';

    // onchange - event вызываемый, если в input будет загружен какой либо файл
    // Добавляем в onchange обработку выбранного фото 
    input.onchange = async e => { 

        var file = e.target.files[0]; 
        var url = URL.createObjectURL(file);
        console.log(url)
        response = await fetch(url);
        var result = await response.json();
        
        pageHelper.geoJsonImport(result);
    }
    

    input.click(); 

}

// Это хуыня для вкладок(основное, комментарии, фотографии), спизженная из интернета.
function showTabContent(evt, tabContent){
    if (changesMode){
        buildRouteOnMap(JSON.parse(route.points));
        changesMode = false;
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