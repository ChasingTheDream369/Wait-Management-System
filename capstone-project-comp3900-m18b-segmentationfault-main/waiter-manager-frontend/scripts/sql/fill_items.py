from utils import *

ITEMS_PATH = "C:/data/unsw/COMP3900/capstone-project-comp3900-m18b-segmentationfault/waiter-manager-frontend/mock/menu_items.json"

def json_to_items(raw_data):
    data = raw_data['data']
    items = []
    for i in range(0, 5):
        for item in data:
            cat_id = item['cat_id']+10*i 
            items.append((item['name'], item['price'],  item['description'],','.join(item['ingredients']) ,item['stock'],item['img_url'],item['speciality'],item['index'], i+1, cat_id ))
    return items

def main():
    raw_data = read_json(ITEMS_PATH)
    items = json_to_items(raw_data)
    conn = get_conn()
    c = conn.cursor() 
    # Write to db
    c.executemany(
        """
        INSERT INTO item ( name, price, description, ingredients, stock, img_url, speciality, `index`, r_id, cat_id)
        VALUES (%s, %s, %s,%s, %s, %s,%s, %s, %s,%s)
        """,
        items
    )
    conn.commit()
    close_conn(conn)


if __name__ == '__main__':
    main()
