from utils import *

RES_PATH = "C:/data/unsw/COMP3900/capstone-project-comp3900-m18b-segmentationfault/waiter-manager-frontend/mock/restaurants.json"

def json_to_res(raw_data):
    data = raw_data['data']
    res = [] 
    for r in data:
        res.append((r['id'], r['name'], 'address',  'desc', 'img_url' ))
    return res

def main():
    raw_data = read_json(RES_PATH)
    res = json_to_res(raw_data)
    conn = get_conn()
    c = conn.cursor()
    print(res)
    # Write to db
    c.executemany(
        """
        INSERT INTO restaurant (id, name, address, description, img_url)
        VALUES (%s, %s, %s, %s, %s)
        """,
        res
    )
    conn.commit()
    close_conn(conn)


if __name__ == '__main__':
    main()
