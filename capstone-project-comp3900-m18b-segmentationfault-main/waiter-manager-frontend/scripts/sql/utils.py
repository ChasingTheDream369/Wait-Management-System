import os
import json
import mysql.connector

def get_conn():
    cnx = mysql.connector.connect(user='root', password='078065',
                              host='127.0.0.1',
                              database='test')
    return cnx

def close_conn(cnx):
    cnx.close()

def read_json(path):
    f = open(path, 'r', encoding='utf-8')
    data = json.load(f)
    f.close()
    return data

