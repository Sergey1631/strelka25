import os
import random
import sqlite3
import string
from flask import Flask, json, redirect, render_template, request, session
from PIL import Image
#from werkzeusg.utils import secure_filename

app = Flask(__name__)
app.config['profilePicsPath'] = 'static\\images\\profilePics\\'

app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

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

    # Запрос для получения пользователя с id, равному user_id из сессии
    cursor.execute('SELECT * FROM users WHERE id=?', [session['user_id']])

    user = cursor.fetchone()

    # Формируем словарь и возвращаем его в формате json
    # Чтобы было удобнее работать с данными в JS
    # И обращаться непосредственно к аттрибуту, а не по индексу
    # Например, localUser.username, вместо localUser[3]
    userDict = {
        'id':user[0],
        'email':user[1],
        'username':user[3],
        'picname':user[4],
        'admin':user[5]
    }
    
    connection.close()
    return json.dumps(userDict)

#------------------------------

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
        
        connection.close()
        id = str(cursor.fetchone()[0])
        session['user_id'] = id
        resp = redirect("/profile")
        resp.set_cookie('user_id', id)
        return resp 

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
        resp = redirect("/")
        resp.set_cookie('user_id', user_id)
        session['user_id'] = user_id

        connection.close()

        return resp
    return render_template("/signup.html")

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

            # Сохраняем фото в пути app.config['profilePicsPath']
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

@app.route('/getPublicRoutes/', methods=['GET'])
def getPublicRoutes():
    connection = sqlite3.connect('database.db')

    cursor = connection.cursor()

    cursor.execute('SELECT * FROM routes WHERE public=1')
    routes = cursor.fetchall()
    print(routes)
    return routes

@app.route('/getRoute/', methods=['GET', 'POST'])
def getRoute():
    if request.method == 'POST':
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()

        cursor.execute('SELECT points FROM routes WHERE creator_id=1')
        points = cursor.fetchone()[0]
        return points

                    
app.run("0.0.0.0", debug=True)