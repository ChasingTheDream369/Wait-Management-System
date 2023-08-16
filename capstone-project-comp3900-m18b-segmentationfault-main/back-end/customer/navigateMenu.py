import os
from flask import Blueprint
from flask import jsonify, request
from exts import db
from models import *
from macros import *
bp = Blueprint('customer_navigateMenu',__name__,)

'''
    
    Check if the restaurant exists and if it does then find all the categories in the 
    restaurant which are valid and have not been deleted. For each category we return its
    id, name and index.
            
            Route: /categories
            
            Methods : POST
             
                r_id : integer (Restaurant Id)
                
            Returns:
            
                Example:
                    {
                      "code": 200,
                      "data": [
                        {
                          "id": 1,
                          "name": "afafa",
                          "index": 0
                        },
                        {
                          "id": 2,
                          "name": "bfafa",
                          "index": 1
                        }
                      ]
                    }
                     
                    
'''

@bp.route('/categories', methods=['GET'])
def categories():
    # check if given input valid or not
    restaurant_id = request.args.get('r_id')
    if not restaurant_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=restaurant_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})    
    # collect categories information for the restaurant
    categories = Category.query.filter_by(r_id=restaurant_id, valid_cat=True).order_by(Category.index).all()
    all_categories = []
    for category in categories:
        all_categories.append({'id': category.id, 'name': category.name, 'index': category.index})

    return jsonify({'code': 200, 'data': all_categories})


'''
    
    Check if the restaurant exists and if it does then find all the items in the 
    restaurant which are valid and have not been deleted. We also check if the image 
    for the item is avalable in the backend and is valid and if it is then we share 
    details of all the items. 
            
            Route: /categories
            
            Methods : POST
             
                r_id : integer (Restaurant Id)
                
            Returns:
            
                Example:
                    
                    {
                      "code": 200,
                      "data": [
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
                     
                    
'''

@bp.route('/menu_items', methods=['GET'])
def menu_items():
    # check if given input valid or not
    restaurant_id = request.args.get('r_id')
    if not restaurant_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=restaurant_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})
    # collect items
    items = Item.query.filter_by(r_id=restaurant_id, valid_item=True).order_by(Item.index).all()
    all_menu_items = []
    for item in items:
        Img_http_request = ''
        # make image http url 
        if item.img_url != None :
            try:
                file_dir = os.path.join(basedir, IMAGE_FOLDER)
                open(os.path.join(file_dir, '%s' % item.img_url), "rb")
                Img_http_request = f'http://127.0.0.1:5000/image?image={item.img_url}'
            except:
                item.img_url = None
                db.session.commit()
        all_menu_items.append(
                {'id': item.id, 'name': item.name, 'price': item.price, 'description': item.description,
                     'ingredients': item.ingredients.split(","), 'stock': item.stock, 'img_url': Img_http_request,
                     'speciality': item.speciality, 'index': item.index,
                     'r_id': item.r_id, 'cat_id': item.cat_id})

    return jsonify({'code': 200, 'data': all_menu_items})
