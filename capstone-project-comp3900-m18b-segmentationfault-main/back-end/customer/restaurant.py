import os
from flask import Blueprint
from flask import jsonify, request
from exts import db
from models import *
from sqlalchemy import desc
from macros import *
bp = Blueprint('customer_restaurant',__name__,)


'''
    
    Get the names and ids of all the restaurants that are registered within the system.

            Route: /restaurants
            
            Methods : GET
            
            Returns:
                Example:
                    {
                      "code": 200,
                      "data": [
                        {
                          "name": "Restaurant A",
                          "id": 1
                        },
                        {
                          "name": "Restaurant B",
                          "id": 2
                        },
                        {
                          "name": "Restaurant C",
                          "id": 3
                        }
                      ]
                    }
'''

@bp.route('/restaurants', methods = ['GET'])
def restaurants():
    rests = Restaurant.query.all()
    # collect all of restaurants then return 
    restaurants = []
    for res in rests:
        restaurants.append({'name': res.name, 'id': res.id})
    return jsonify({'code': 200, 'data': restaurants})

'''
    
    Get the id, name, address, description, img_urls, lat, long and specials for the restaurant by the id 
    given.

            Route: /restaurants/{id}
            
            Methods : GET
                
                id : integer ("restaurant id")
            
            Returns:
                
                Example:
                    {
                      "code": 200,
                      "data": {
                        "id": 1,
                        "name": "afafa",
                        "address": "afafa",
                        "description": "afafa",
                        "img_urls": [
                          "1fafa",
                          "fafafa"
                        ],
                        "lat": "24.9999",
                        "lon": "12.2344",
                        "specials": [
                          {
                            "id": 3,
                            "name": "kafafa",
                            "price": 14.13,
                            "description": "this is a food",
                            "ingredients": "meat, vegetables",
                            "stock": 99,
                            "img_url": "http://www.google.com",
                            "speciality": false,
                            "index": 0,
                            "r_id": 4,
                            "cat_id": 3
                          },
                          {
                            "id": 4,
                            "name": "gafafa",
                            "price": 16.13,
                            "description": "this is another food",
                            "ingredients": "meat, vegetables",
                            "stock": 99,
                            "img_url": "http://www.google.com",
                            "speciality": false,
                            "index": 1,
                            "r_id": 4,
                            "cat_id": 3
                          }
                        ]
                      }
                    }
'''

@bp.route('/restaurants/<id>', methods = ['GET'])
def get_rest_details(id):
    # check given input is valid or not
    restaurants = Restaurant.query.filter_by(id=id).first()
    if not restaurants:
        return jsonify({'code': 404, 'message': "restaurant id does not exist"}) 
    # show first 10 special items for restaurant
    specials = Item.query.filter_by(r_id = id, speciality = True, valid_item = True).order_by(desc(Item.stock)).all()
    specials = specials[:10]
    # collect special items 
    specialities = []
    for special in specials:
        Img_special = ''
        # if special item has image, make http image url for it ,otherwise return null
        if special.img_url != None :
            try:
                file_dir = os.path.join(basedir, IMAGE_FOLDER)
                open(os.path.join(file_dir, '%s' % special.img_url), "rb")
                Img_special = f'http://127.0.0.1:5000/image?image={special.img_url}'
            except:
                special.img_url = None
                db.session.commit()
        specialities.append({'id' : special.id, 'name' : special.name, 'price' : special.price, 
                            'description' : special.description, 'ingredients' : special.ingredients.split(","), 
                            'stock' : special.stock, 'img_url' : Img_special, 'speciality' : special.speciality,
                            'index' : special.index, 'r_id' : special.r_id, 'cat_id' : special.cat_id})
    # restaurant image url collect
    res_url_list = []
    if restaurants.img_url != None:
        data = restaurants.img_url.split(',')
        for res in data:
            res_url_list.append(f'http://127.0.0.1:5000/image?image={res}')

    return jsonify({'code' : 200, 'data' : {'id' : restaurants.id, 'name' : restaurants.name, 'address' : restaurants.address,
                                            'description' : restaurants.description, 'img_urls' : res_url_list, 
                                            'lat' : restaurants.lat, 'lon' : restaurants.lon, 'specials' : specialities}})

'''
    
    Look at the restaurant by the id, and if the restaurant is present then search all the 
    Tables at the restaurant and return the id, name, capacity and status for each table in 
    the restaurant.

            Route: /tables
            
            Methods : GET
                
                r_id : integer (Restaurant Id) 
                
            Returns:
            
                Example:
                    {
                      "code": 200,
                      "data": [
                        {
                          "id": 1,
                          "name": "A1",
                          "capacity": 4,
                          "status": 0
                        },
                        {
                          "id": 2,
                          "name": "A2",
                          "capacity": 4,
                          "status": 1
                        },
                        {
                          "id": 3,
                          "name": "A3",
                          "capacity": 4,
                          "status": 2
                        }
                      ]
                    }
'''

@bp.route('/tables', methods=['GET'])
def tables():
    # check if given input valid or not
    restaurant_id = request.args.get('r_id')
    if not restaurant_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=restaurant_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"}) 
    # collect tables for the restaurant
    all_tables = Table.query.filter_by(r_id=restaurant_id, valid_table=True).all()
    Tables = []
    for table in all_tables:
        Tables.append({'id': table.id, 'name': table.name, 'capacity': table.capacity, 'status': table.status})

    return jsonify({'code': 200, 'data': Tables})

