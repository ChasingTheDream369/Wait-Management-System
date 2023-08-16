from flask import Blueprint
from flask import  jsonify, request,session
from exts import db
from models import *
import os
from macros import *
from sqlalchemy import text
bp = Blueprint('manager_restaurant',__name__,)


'''
   Get restaurant with new infomation, if system is free and restaurant name does not
   conflict with other restaurant name, then we update restaurant info in database

        Route : /restaurants/<id>

        Method : PUT
            id : int (Restaurant id) 
            address : str (Restaurant new address)
            description : str (Restaurant new description)
            name : str (Restaurant new name)
            img_urls : array (
                str (Restaurant new img_urls)
            )
            lat : decimal (Restaurant new latitude)
            lon : decimal (Restaurant new longitude)


        Returns:
            Example:
                {
                    "code":200
                }
'''

# update restaurant
@bp.route('/restaurants/<id>', methods=['PUT'])
def update_restaurant(id):
    restaurants = Restaurant.query.filter_by(id=id).first()
    # check if queue exist
    if not restaurants:
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})
    # check if given inputs are valid or not
    data = request.get_json()
    #params checks
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})   
    if 'address' not in list(data.keys()) or not data['address']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'description' not in list(data.keys()) or not data['description']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'name' not in list(data.keys()) or not data['name']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'img_urls' not in list(data.keys()) or not data['img_urls']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'lat' not in list(data.keys()) or not data['lat']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'lon' not in list(data.keys()) or not data['lon']:
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

    # restaurant image urls
    res_list = []
    img_urls = data['img_urls']
    for img_url in img_urls:
        img = img_url.split('=')
        if len(img) == 1:
            return jsonify({'code': 400, 'message': "Invalid params"})
        get_img = img[1]
        if not get_img:
            return jsonify({'code': 400, 'message': "Invalid params"})
        if '.' not in get_img:
            return jsonify({'code': 400, 'message': "Invalid params"})
        if get_img.count('.') > 1:
            return jsonify({'code': 400, 'message': "Invalid params"})
        if get_img.split(".")[1] not in ALLOWED_EXTENSIONS:
            return jsonify({'code': 400, 'message': "Invalid params"})
        res_list.append(get_img)

        # check the file path
        try:
            file_dir = os.path.join(basedir, IMAGE_FOLDER)
            open(os.path.join(file_dir, '%s' % get_img), "rb")
        except:
            return jsonify({'code': 404, 'message': "Img does not exists."})
    

    # not allow update restaurant when some customer using 
    if len(Table.query.filter(Table.r_id == id).all()) != len(Table.query.filter(Table.r_id == id,Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "Some customer is in your restaurant now, you could update this restaurant when restaurant is free."})
    # not allow update restaurant when some customer queuing
    if len(Queue.query.filter(Queue.r_id == id).all()) != 0:
        return jsonify({'code': 404, 'message': "Some customer is queuing for tables now, you could update this restaurant when restaurant is free."})
    # restaurant name must be unique
    sql = "select * from restaurant where binary name =:para"
    restaurant_tar = db.session.execute(text(sql),{'para':data['name']}).fetchone()
    if restaurant_tar is not None and restaurant_tar.id != int(id):
        return jsonify({'code': 404, 'message': "Restaurant name already exist."}) 
    # update restaurantid
    restaurants.name = data['name']
    restaurants.address = data['address']
    restaurants.description = data['description']
    restaurants.img_url = ','.join(res_list)
    restaurants.lat = data['lat']
    restaurants.lon = data['lon']
    db.session.commit()
    return jsonify({'code': 200})