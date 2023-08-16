from flask import Blueprint
from flask import  jsonify, request,session
from exts import db
from models import *
import os
from sqlalchemy import text
from macros import *
bp = Blueprint('manager_item',__name__,)



'''
   Get new item details and restaurant_id, if system is free and item
   name not clash with existing category, then we calculate new index for it 
   and create new item record in database

        Route : /menu_items

        Method : POST
            r_id : str (Restaurant id) 
            name : str (Item name)   
            price: decimal (Item price)
            description : str (Item description)
            ingredients : array (
                str (Item ingredient)
            )
            stock : int (Item stock)
            img_url : str (Item image url)
            specicality : boolean (Item special or not)
            cat_id : int (Item's category id)

        
        Returns:
            Example:
                {
                    "code":200
                }
'''

# add new items for a restaurant
@bp.route('/menu_items', methods = ['POST'])
def add_menuItems():
    rest_id = int(request.args.get('r_id'))
    if not rest_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=rest_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})
    # check if given input valid or not
    data = request.get_json()
    # params checks
    if not data:
        return jsonify({'code': 400, 'message': "invalid params1"})
    if 'name' not in list(data.keys()) or not data['name']:
        return jsonify({'code': 400, 'message': "invalid params2"})
    if 'price' not in list(data.keys()) or not data['price'] :
        return jsonify({'code': 400, 'message': "invalid params3"})
    if 'description' not in list(data.keys()) or not data['description'] :
        return jsonify({'code': 400, 'message': "invalid params4"})
    if 'ingredients' not in list(data.keys()) or not data['ingredients']:
        return jsonify({'code': 400, 'message': "invalid params5"})
    if 'stock' not in list(data.keys()) :
        return jsonify({'code': 400, 'message': "invalid params6"})
    if 'img_url' not in list(data.keys()) or not data['img_url'] :
        return jsonify({'code': 400, 'message': "invalid params7"})
    if 'speciality' not in list(data.keys()) :
        return jsonify({'code': 400, 'message': "invalid params8"})
    if 'cat_id' not in list(data.keys()) or not data['cat_id']:
        return jsonify({'code': 400, 'message': "invalid params10"})
    if float(data['price']) <= 0 or data['stock'] < 0:
        return jsonify({'code': 400, 'message': "invalid params"})
    
     # not allow add items when some customer using 
    if len(Table.query.filter(Table.r_id == rest_id).all()) != len(Table.query.filter(Table.r_id == rest_id,Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could add items when restaurant is free"})
    # not allow add items when some customer queuing
    if len(Queue.query.filter(Queue.r_id == rest_id).all()) != 0:
        return jsonify({'code': 404, 'message': "some customer is queuing now, you could add items when restaurant is free"})
    # item names in a restaurant must be unique

    sql = "select * from item where binary name =:para and r_id =:para2 and valid_item = 1"
    item_tar = db.session.execute(text(sql),{'para':data['name'],'para2':rest_id}).fetchone()

    if item_tar is not None:
        return jsonify({'code': 404, 'message': "item name already exist"})
    # check session
    staff_id = session.get('staff_id')
    staff_role = session.get('role')
    if not staff_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not staff_role:
        return jsonify({'code': 400, 'message': "invalid params"})
    # only manager has access to see information
    if staff_role != "manager":
        return jsonify({'code': 404, 'message': "this staff is not manager"}) 

    #Check if the img_url is valid or not.
    img_url = data['img_url']
    img = img_url.split('=')
    if len(img) == 1:
        return jsonify({'code': 400, 'message': "invalid params"})
    get_image = img[1]
    if not get_image:
        return jsonify({'code': 400, 'message': "invalid params"})
    if '.' not in get_image:
        return jsonify({'code': 400, 'message': "invalid params"})
    if get_image.count('.') > 1:
        return jsonify({'code': 400, 'message': "invalid params"})
    if get_image.split(".")[1] not in ALLOWED_EXTENSIONS:
        return jsonify({'code': 400, 'message': "invalid params"})
    
    # check the file path
    try:
        file_dir = os.path.join(basedir, IMAGE_FOLDER)
        open(os.path.join(file_dir, '%s' % get_image), "rb")
    except:
        return jsonify({'code': 404, 'message': "img does not exists"})

    #Check the r_id and cat_id.
    if rest_id <= 0:
        return jsonify({'code': 404, 'message': "r_id does not exists"})

    res_id = Restaurant.query.filter_by(id = rest_id).first()
    if not res_id:
        return jsonify({'code': 404, 'message': "r_id does not exists"})

    if data['cat_id'] <= 0:
        return jsonify({'code': 404, 'message': "cat_id does not exists"})

    # check category id
    category_id = Category.query.filter_by(id = data['cat_id']).first()

    if not category_id:
        return jsonify({'code': 404, 'message': "cat_id does not exists"})
    
    
    # Find the index for item
    items = Item.query.filter_by(cat_id = data['cat_id']).all()
    item_index = len(items)

    #Create the new item and add information for that item
    item = Item(name = data['name'], price = data['price'], description = data['description'], 
    ingredients = ",".join(data['ingredients']), stock = data['stock'], img_url = get_image, 
    speciality = data['speciality'], r_id = rest_id, cat_id = data['cat_id'], index = item_index)

    db.session.add(item)
    db.session.commit()
    
    return jsonify({'code': 200})



'''
   Get item which ask for deletion, if system is free and item
   exist, then change it's valid_item attribute to False

        Route : /menu_items/<id>

        Method : DELETE
            id   : int (Category id) 

        
        Returns:
            Example:
                {
                    "code":200

                }
'''

# delete item by search given id
@bp.route('/menu_items/<id>', methods=['DELETE'])
def del_items(id):
    staff_id = session.get('staff_id')
    staff_role = session.get('role')
    # check if given input valid or not
    item = Item.query.filter_by(id=id).first()
    if not item:
        return jsonify({'code': 404, 'message': "item id does not exist"})
    
    if id == 0:
        return jsonify({'code': 404, 'message': "item id cant be 0"})
    # check session
    if not staff_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not staff_role:
        return jsonify({'code': 400, 'message': "invalid params"})
    # only manager has access to see information
    if staff_role != "manager":
        return jsonify({'code': 404, 'message': "this staff is not manager"}) 
    
     # not allow delete items when some customer using 
    if len(Table.query.filter(Table.r_id == item.r_id).all()) != len(Table.query.filter(Table.r_id == item.r_id,Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could delete items when restaurant is free"})
    # not allow delete items when some customer queuing
    if len(Queue.query.filter(Queue.r_id == item.r_id).all()) != 0:
        return jsonify({'code': 404, 'message': "some customer is queuing now, you could delete items when restaurant is free"})
    # delete item 
    Item.query.filter_by(id=id).update({"valid_item": False})
    db.session.commit()
    return jsonify({'code': 200})


'''
   Get items with new infomation, if system is free and items do not
   have duplicate indexes, then we update items in database

        Route : /menu_items

        Method : PUT
            r_id : str (Restaurant id) 
            array (
                name : str (Item name)   
                price: decimal (Item price)
                description : str (Item description)
                ingredients : array (
                    str (Item ingredient)
                )
                stock : int (Item stock)
                img_url : str (Item image url)
                specicality : boolean (Item special or not)
                cat_id : int (Item's category id)
            )
            
        
        Returns:
            Example:
                {
                    "code":200
                }
'''

# update item information
@bp.route('/menu_items', methods=['PUT'])
def update_items():

    rest_id = int(request.args.get('r_id'))
    if not rest_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=rest_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})
    data = request.get_json()
    # params checks
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    # check array[object] is valid or not
    for i in data:
        if 'id' not in list(i.keys()) or not i['id']:
            return jsonify({'code': 400, 'message': "invalid params"})
        if 'name' not in list(i.keys()) or not i['name']:
            return jsonify({'code': 400, 'message': "invalid params"})
        if 'price' not in list(i.keys()) or not i['price']:
            return jsonify({'code': 400, 'message': "invalid params"})
        if 'description' not in list(i.keys()) or not i['description']:
            return jsonify({'code': 400, 'message': "invalid params"})
        if 'ingredients' not in list(i.keys()) or not i['ingredients']  :
            return jsonify({'code': 400, 'message': "invalid params"})
        if 'stock' not in list(i.keys()) :
            return jsonify({'code': 400, 'message': "invalid params"})
        if 'img_url' not in list(i.keys()) or not i['img_url']:
            return jsonify({'code': 400, 'message': "invalid params"})
        if 'speciality' not in list(i.keys()) :
            return jsonify({'code': 400, 'message': "invalid params"})
        if 'index' not in list(i.keys()) :
            return jsonify({'code': 400, 'message': "invalid params"})
        if 'cat_id' not in list(i.keys()) or not i['cat_id']:
            return jsonify({'code': 400, 'message': "invalid params"})
        if float(i['price']) <= 0 or i['stock'] < 0:
            return jsonify({'code': 400, 'message': "invalid params"})
    # check session
    staff_id = session.get('staff_id')
    staff_role = session.get('role')
    if not staff_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not staff_role:
        return jsonify({'code': 400, 'message': "invalid params"})
    # only manager has access to see information
    if staff_role != "manager":
        return jsonify({'code': 404, 'message': "this staff is not manager"}) 

    update_ids = []
    for i in data:
        update_ids.append(i['id'])

    original_indexs = []
    items = Item.query.filter_by(r_id=rest_id,cat_id =data[0]['cat_id'],valid_item=1).all()
    for i in items:
        if i.id not in update_ids:
            original_indexs.append(i.index)
    for i in data:
        if i['index'] in original_indexs:
            return jsonify({'code': 400, 'message': "duplicate index"})
    
    # item names in a restaurant must be unique
    sql = "select * from item where binary name =:para and r_id =:para2 and valid_item = 1"
    #checking if the item being updated is available and if yes then we update it.
    for i in data:
        items = Item.query.filter_by(id=i['id']).first()
        if not items:
            return jsonify({'code': 400, 'message': "invalid item"})
        if items.valid_item == False:
            return jsonify({'code': 400, 'message': "invalid item1"})
        # not allow update items when some customer using 
        if len(Table.query.filter(Table.r_id == rest_id).all()) != len(Table.query.filter(Table.r_id == rest_id,Table.status == EMPTY).all()):
            return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could update items when restaurant is free"})
        # not allow update items when some customer queuing
        if len(Queue.query.filter(Queue.r_id == rest_id).all()) != 0:
            return jsonify({'code': 404, 'message': "some customer is queuing now, you could update items when restaurant is free"})
        # item names in a restaurant must be unique
        item_tar = db.session.execute(text(sql),{'para':i['name'],'para2':rest_id}).fetchone()
        if item_tar is not None and item_tar.id != i['id']:
            return jsonify({'code': 404, 'message': "item name already exist"})

        # img url handle    
        img_url = i['img_url']
        img = img_url.split('=')
        if len(img) == 1:
            return jsonify({'code': 400, 'message': "invalid params"})
        get_image = img[1]
        if not get_image:
            return jsonify({'code': 400, 'message': "invalid params"})
        if '.' not in get_image:
            return jsonify({'code': 400, 'message': "invalid params"})
        if get_image.count('.') > 1:
            return jsonify({'code': 400, 'message': "invalid params"})
        if get_image.split(".")[1] not in ALLOWED_EXTENSIONS:
            return jsonify({'code': 400, 'message': "invalid params"})
        
        # check the file path
        try:
            file_dir = os.path.join(basedir, IMAGE_FOLDER)
            open(os.path.join(file_dir, '%s' % get_image), "rb")
        except:
            return jsonify({'code': 404, 'message': "img does not exists"})
    
        # update item information
        Item.query.filter_by(id=i['id']).update({"id":i['id'],"name":i['name'], "price":i['price'], "description":i['description'], "ingredients":",".join(i['ingredients']), "stock":i['stock'], "img_url":get_image, "speciality":i['speciality'], "index":i['index']})
        db.session.commit()
        
    return jsonify({'code': 200})