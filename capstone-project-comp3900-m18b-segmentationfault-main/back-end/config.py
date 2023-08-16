# DATA BASE INFO TO CONNECT
import datetime
HOSTNAME = '127.0.0.1'
PORT     = '3306'
DATABASE = 'test'
USERNAME = 'root'
PASSWORD = 'root'
DB_URI = 'mysql+pymysql://{}:{}@{}:{}/{}'.format(USERNAME,PASSWORD,HOSTNAME,PORT,DATABASE)
SQLALCHEMY_DATABASE_URI = DB_URI
SQLALCHEMY_TRACK_MODIFICATIONS = False # this one i dont know what does this do for now
SECRET_KEY = "comp3900m18b"
CORS_HEADERS = 'Content-Type'
PERMANENT_SESSION_LIFETIME = datetime.timedelta(seconds=60*60)
