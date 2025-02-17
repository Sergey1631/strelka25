import os
import random
import sqlite3
import string
import exportRoutes
from flask import Flask, json, redirect, render_template, request, session
from PIL import Image

app = Flask(__name__)
app.config['profilePicsPath'] = 'static\\images\\profilePics\\'
app.config['routePhotosPath'] = 'static\\images\\routes\\'

app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        jsonData = request.get_json()
        
        password = jsonData['password']
        email = jsonData['email']
        
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()
        user = (email, password)
        
        #Запрос на проверку существования пользователя в БД с указанной почтой и паролем
        #Если пользователь существует - вернётся 1
        cursor.execute('SELECT EXISTS(SELECT 1 FROM users WHERE email=? AND password=?)', user)
        isUserExists = cursor.fetchone() == (1,)

        if not isUserExists:
            return makeError("Неправильные эл.почта или пароль")
        
        # Получаем id вошедшего пользователя для записи в сессию
        cursor.execute('SELECT id FROM users WHERE email=? AND password=?', user)
        
        id = str(cursor.fetchone()[0])
        session['user_id'] = id
        connection.close() 
        response = redirect("/profile") # Адрес для переадресации
        response.set_cookie('user_id', id)
        return response 

    return render_template("login.html")

@app.route('/signup',  methods=['GET', 'POST'])
def signUp():
    if request.method == 'POST':
        jsonData = request.get_json()
        
        email = jsonData['email']
        password = jsonData['password']
        username = jsonData['username']
        
        connection = sqlite3.connect('database.db')
        cursor = connection.cursor()

        # Проверка на ввод данных. 
        # Если введены неправильно, вернётся соответсвующая makeError(ошибка)
        if not(email and password and username):
            return makeError("Введены не все данные")
        
        if '@' not in email or email[0] == '@':
            return makeError('Неправильный адрес электронной почты')
        
        if len(password) < 8:
            return makeError("Пароль слишком короткий")

        # Проверка на существование пользователя с введённой почтой
        
        cursor.execute('SELECT EXISTS(SELECT 1 FROM users WHERE email=?)', [email])
        isExists = cursor.fetchone() == (1,)
        
        # Если пользователь существует, то выдаём ошибку о существовании пользователя с такой почтой

        if isExists:
            return makeError("Пользователь уже существует")    
    
        user = (email, password, username)
        cursor.execute('INSERT INTO users (email, password, username) VALUES (?, ?, ?)', user)
        connection.commit()
        
        user_id = str(cursor.lastrowid)
        resp = redirect("/profile")
        resp.set_cookie('user_id', user_id)
        session['user_id'] = user_id

        connection.close()

        return resp
    return render_template("/signup.html")

@app.route('/logout', methods=['GET', 'POST'])
def logOut():
    session.pop('user_id', None)
    response = redirect("/map") # Адрес для переадресации
    #response.set_cookie('user_id', id)
    return response 

#-----Страница профиля-----
#Проверяется, вошёл ли пользователь в аккаунт. Если не вошёл, то выводится страница с предложением войти в аккаунт
@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user_id' in session:
        return render_template("/profile.html")
    else:
        return render_template("/notLoggedIn.html")

#-----Страница изменения данных профиля-----
#Проверяется, вошёл ли пользователь в аккаунт. Если не вошёл, то выводится страница с предложением войти в аккаунт
@app.route('/editProfile', methods=['GET', 'POST'])
def editProfile():
    if 'user_id' in session:
        return render_template("/editProfile.html")
    else: 
        return render_template("/notLoggedIn.html")      

# route для сохранения изменённых данных о пользователя
# Обычно при передаче данных из браузера использовался json
# Но здесь используется form т.к. в json нельзя передавать файлы(в нашем случае аватарку пользователя) 
@app.route('/profile/saveProfileChanges', methods=['POST'])
def saveProfileChanges():
    if request.method == 'POST':        

        newUsername = request.form['username']  
        connection = sqlite3.connect('database.db')
        cursor = connection.cursor()
        cursor.execute('UPDATE users SET username = ? WHERE id = ?', (newUsername, session['user_id']))
        
        # Если пользователь изменил фотографию, то сохраняем её в хранилище и записываем её имя в БД
        if 'photo' in request.files:
            photo = request.files['photo']

            # Генерируем имя для фотографии
            filename = id_generator() + '.jpg' 

            # Сохраняем фото по пути app.config['profilePicsPath']
            photo.save(app.config['profilePicsPath'] + os.path.join(filename))  

            # Открываем изображение и изменяем его размер на 164x164
            img = Image.open(app.config['profilePicsPath'] + filename) 
            img = img.resize((164, 164))
            img.save(app.config['profilePicsPath'] + os.path.join(filename), format='JPEG')

            cursor.execute('UPDATE users SET picname = ? WHERE id = ?', (filename, session['user_id']))

        connection.commit()
        connection.close() 
        return 'ok'
    
#route для отображения карты
@app.route('/map')
def showmap():
    return render_template("/map.html")

@app.route('/myRoutes')
def myRoutes():
    if 'user_id' in session:
        return render_template("/myRoutes.html")
    else:
        return render_template("/notLoggedIn.html")

@app.route('/export', methods=['POST'])
def export():
    if request.method == 'POST':
        jsonData = request.get_json()
        
        route_id = jsonData['id']
        export_type = jsonData['export_type']
        points = jsonData['points']

        #print(points)
        if export_type == 'gpx':
            return exportRoutes.export_gpx(points, route_id)
        if export_type == 'kmz':
            return exportRoutes.export_kmz(points, route_id)
        if export_type == 'kml':
            return exportRoutes.export_kml(points, route_id)

def getPhotosForRoute(id):
    connection = sqlite3.connect('database.db')

    cursor = connection.cursor()
    cursor.execute('SELECT * FROM comments WHERE route_id=?', [id])
    comments = cursor.fetchall()
    connection.close()
    return comments
# Получаем комментарии к маршруту по его id и возвращаем массив словарей
def getCommentsForRoute(id):
    connection = sqlite3.connect('database.db')

    cursor = connection.cursor()
    cursor.execute('SELECT * FROM comments WHERE route_id=?', [id])
    comments = cursor.fetchall()

    commentsArr = []
    connection.close()
    for com in comments:
        commentDict = {
            'id': com[0],
            'creator_id': com[1],
            'route_id': com[2],
            'comment': com[3],
            'parent_comment_id': com[4]
        }
        commentsArr.append(commentDict)
    return commentsArr

# route для оставления комментария к маршруту
@app.route('/makeComment', methods =['POST'])
def makeComment():
    if 'user_id' in session:
        jsonData = request.get_json()
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()
        
        routeId = jsonData['route_id']
        comment = jsonData['comment']

        commentTuple = (session['user_id'], routeId, comment, 0)

        query = 'INSERT INTO comments (creator_id, route_id, comment, parent_comment_id) VALUES (?, ?, ?, ?)'
        cursor.execute(query, commentTuple)
        connection.commit()
        connection.close()
        return 'ok'
    else:
        return makeError("Вы не авторизованы")
    
#-----Дальше идёт функционал маршрутов, он не доделан-----
@app.route('/saveRoute/', methods=['GET', 'POST'])
def saveRoute():
    if request.method == 'POST':
        jsonData = request.get_json()
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()
        
        points = jsonData['route']
        user = (1, str(jsonData))

        cursor.execute('INSERT INTO routes (creator_id, points) VALUES (?, ?)', user)
        connection.commit()
        connection.close()
        return 'ok'

# Получаем все публичные маршруты
@app.route('/getPublicRoutes/', methods=['GET'])
def getPublicRoutes():
    connection = sqlite3.connect('database.db')

    cursor = connection.cursor()

    cursor.execute('SELECT * FROM routes WHERE public=1')
    routes = cursor.fetchall()
    routesArr = []
    for route in routes:
        routesArr.append(makeRouteDict(route))
    return routesArr

# Получаем все свои маршруты
@app.route('/getMyRoutes/', methods=['GET'])
def getMyRoutes():
    connection = sqlite3.connect('database.db')

    cursor = connection.cursor()

    jsonData = request.get_json()
    cursor.execute('SELECT * FROM routes WHERE creator_id=?', jsonData['creator_id'])
    routes = cursor.fetchall()
    routesArr = []
    for route in routes:
        routesArr.append(makeRouteDict(route))
    return routesArr

# Получаем маршрут и информацию о нём из БД по его id
@app.route('/getRoute/', methods=['GET', 'POST'])
def getRoute():
    if request.method == 'POST':
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()

        jsonData = request.get_json()

        cursor.execute('SELECT * FROM routes WHERE id=?', [jsonData['route_id']])
        route = cursor.fetchone()

        connection.close()
        return makeRouteDict(route)
    

def getRouteChanges(id):
    if request.method == 'POST':
        connection = sqlite3.connect('database.db')
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()

        jsonData = request.get_json()

        cursor.execute('SELECT * FROM changes WHERE route_id=?', [jsonData['route_id']])
        changes = cursor.fetchall()

        
        connection.close()
        return json.dumps([dict(c) for c in changes])


#----Вспомогательные функции----
# Функция для возврата ошибки в json формате
def makeError(errorString):
    data = { 
        "error" : errorString
    } 
    return data

# Функция для генерации рандомной строки (используется для генерации имени загруженной фотографии)
def id_generator(size=32, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))      

# Получаем локального пользователя
# (так я называю пользователя вошедшего в свой аккаунт)
@app.route('/getLocalUser', methods=['GET'])
def getLocalUser():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    if 'user_id' in session:
        # Запрос для получения пользователя с id, равному user_id из сессии
        cursor.execute('SELECT * FROM users WHERE id=?', [session['user_id']])

        user = cursor.fetchone()

        userDict = {
            'id':user[0],
            'email':user[1],
            'username':user[3],
            'picname':user[4],
            'admin':user[5]
        }

        connection.close()
        return json.dumps(userDict)
    else: return makeError('fail')


# Формируем словарь и возвращаем его в формате json
# Чтобы было удобнее работать с данными в JS
# И обращаться непосредственно к аттрибуту, а не по индексу
# Например, route.description, вместо route[7]

# Создание словаря по переданному route из БД 
def makeRouteDict(route):
    comments = getCommentsForRoute(route[0])
    changes = getRouteChanges(route[0])
    routeDict = {
        'id': route[0],
        'creator_id': route[1],
        'name': route[2],
        'points': route[3],
        'public': route[4],
        'rating': route[5],
        'comments': comments,
        'changes': changes,
        'description': route[7],
        'photos': route[8]
    }
    return routeDict

#------------------------------
                
app.run("0.0.0.0", debug=True)