from ctypes import util
from email import utils
import os
from utils import *

def main():
    cnx = get_conn()
    c = cnx.cursor() 
    q = '''
    SELECT 
	`order`.quantity 
    FROM
	`order`
	LEFT JOIN item ON item.id = ORDER.item_id 
WHERE
	ORDER.item_id = 3 
	AND item.last_modified < '2022-10-08';
    '''
    res = c.execute(q)
    close_conn(cnx)

main()

