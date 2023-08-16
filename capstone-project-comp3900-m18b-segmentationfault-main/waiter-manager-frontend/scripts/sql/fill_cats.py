from utils import *

CATS_PATH = "C:/data/unsw/COMP3900/capstone-project-comp3900-m18b-segmentationfault/waiter-manager-frontend/mock/cats.json"

def json_to_cats(raw_data):
    data = raw_data['data']
    cats = []
    for i in range(1, 6):
        for cat in data:
            cats.append((cat['name'], cat['index'],  i ))
    return cats

def main():
    raw_data = read_json(CATS_PATH)
    cats = json_to_cats(raw_data)
    conn = get_conn()
    c = conn.cursor()
    print(cats)
    # Write to db
    c.executemany(
        """
        INSERT INTO category ( name, `index`, r_id)
        VALUES (%s, %s, %s)
        """,
        cats
    )
    conn.commit()
    close_conn(conn)


if __name__ == '__main__':
    main()
