from utils import *

TABLES_PATH = "C:/data/unsw/COMP3900/capstone-project-comp3900-m18b-segmentationfault/waiter-manager-frontend/mock/tables.json"

def json_to_tables(raw_data):
    data = raw_data['data']
    tables = []
    for i in range(1, 6):
        for table in data:
            tables.append((table['name'], 0,  table['capacity'], 0, i ))
    return tables

def main():
    raw_data = read_json(TABLES_PATH)
    tables = json_to_tables(raw_data)
    conn = get_conn()
    c = conn.cursor()
    print(tables)
    # Write to db
    c.executemany(
        """
        INSERT INTO `table` ( `name`, `status`, capacity, need_assist, r_id)
        VALUES (%s, %s, %s, %s, %s)
        """,
        tables
    )
    conn.commit()
    close_conn(conn)


if __name__ == '__main__':
    main()
