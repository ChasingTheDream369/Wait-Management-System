# -*- coding: utf-8 -*-

# sql folder path
import os
import pymysql
from config import HOSTNAME, USERNAME, PASSWORD, DATABASE
from exts import db
from app import app
from models import *



sql_path = os.path.dirname(os.path.abspath(__file__))

sql_file = '/test.sql'
 


def connect_mysql(): 
    # connect to database
    conn = pymysql.connect(host = HOSTNAME, user = USERNAME, password = PASSWORD, db = DATABASE)
    # get cursor
    cursor = conn.cursor() 
    # execucute sql file
    execute_fromfile(sql_path+sql_file, cursor)
 
    # close connection
    conn.commit()
    conn.close()




def execute_fromfile(filename, cursor):  
    # open file (only read)
    fd = open(filename, 'r', encoding='utf-8')  
    # read content
    sqlfile = fd.read()  
    fd.close()
    # split content by ';'
    sqlcommamds = sqlfile.split(';') 
    # execute command
    for command in sqlcommamds:
        try:
            if command != '\n':
                cursor.execute(command)

        except Exception as msg:
            print("error： ", msg)
 
    print('SQL command have done')

with app.app_context():
    db.drop_all()
    db.create_all()
    print('Database has created')
connect_mysql()


