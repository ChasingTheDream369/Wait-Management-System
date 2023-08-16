import json
import os
import random

src = 'C:\\data\\unsw\\COMP3900\\capstone-project-comp3900-m18b-segmentationfault\\waiter-manager-frontend\\mock\\menu_items.json'

target = "C:\\data\\unsw\\COMP3900\\capstone-project-comp3900-m18b-segmentationfault\\waiter-manager-frontend\\mock\\orders.json"

SELECT = 20

def main():
    items = []
    # READ FILE
    fin = open(src)
    raw_data = json.load(fin)
    fin.close()
    # menu items
    menu_items = raw_data['data'] 
    # sample
    selected_items = random.sample(menu_items, SELECT)
    id = 0
    subtotal = 0
    for item in selected_items:
        quantity = random.randint(1, 5)
        status = 3
        items.append({
            "id":id,
            "item_id":item['id'],
            "item_name":item['name'],
            'item_price':item['price'],
            'quantity':quantity,
            "status":status,
            "img_url":item['img_url']
        })
        id+=1
        subtotal += (item['price'] * quantity)
    res = {
        "code":200,
        "data": {
            "items":items,
            "subtotal": subtotal
        }
    }
    with open(target, 'w', encoding="utf-8") as fout:
        json.dump(res, fout, ensure_ascii=False)

main()
