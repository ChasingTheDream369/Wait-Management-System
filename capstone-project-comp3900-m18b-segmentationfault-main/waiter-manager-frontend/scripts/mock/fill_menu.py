# import json
# import os
# import random

# root = 'C:\\data\\unsw\\COMP3900\\capstone-project-comp3900-m18b-segmentationfault\\waiter-manager-frontend\\public\\img\\'
# target = "C:\\data\\unsw\\COMP3900\\capstone-project-comp3900-m18b-segmentationfault\\waiter-manager-frontend\\mock\\menu_items.json"

# def main():
    
#     data = []
#     id = 0
#     for cat_id in range(1, 4):
#         path = root+ str(cat_id)
#         files = os.listdir(path)
#         index = 0
#         for file in files:
#             name = file.split('.')[0]
#             data.append({
#                 "id": id,
#                 "name":name,
#                 "price": random.randint(3, 99),
#                 "description":"desc",
#                 "ingredients":"ingredients",
#                 "stock": random.randint(12,999),
#                 "img_url": "http://localhost:5173/img/"+str(cat_id)+"/"+file,
#                 "speciality":False,
#                 "index": index,
#                 "r_id":4,
#                 "cat_id": cat_id
#             })
#             id+=1
#             index+=1
#     res = {"code":200, "data":data}
#     with open(target, 'w', encoding='utf-8') as f:
#         json.dump(res, f, ensure_ascii=False, indent=4)


# main()
