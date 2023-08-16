from flask import Blueprint
from flask import  jsonify, request,session
from exts import db
from models import *
from sqlalchemy import text
from macros import *
bp = Blueprint('manager_category',__name__,)

'''
   Get new category details and restaurant_id, if system is free and category 
   name not clash with existing category, then we calculate new index for it 
   and create new category record in database

        Route : /categories

        Method : POST
            r_id : str (Restaurant id) 
            name : str (Category name)   

        
        Returns:
            Example:
                {
                    "code":200
                }
'''

# add new categories for restaurant
@bp.route('/categories', methods = ['POST'])
def add_category():
    rest_id = int(request.args.get('r_id'))
    if not rest_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=rest_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})
    # check if given input valid or not
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'name' not in list(data.keys()) or not data['name']:
        return jsonify({'code': 400, 'message': "invalid params"})

    # not allow add categories when some customer using 
    if len(Table.query.filter(Table.r_id == rest_id).all()) != len(Table.query.filter(Table.r_id == rest_id,Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could add categories when restaurant is free"})
    # not allow add categories when some customer queuing
    if len(Queue.query.filter(Queue.r_id == rest_id).all()) != 0:
        return jsonify({'code': 404, 'message': "some customer is queuing now, you could add categories when restaurant is free"})
    # category names in a restaurant must be unique
    sql = "select * from category where binary name =:para and r_id =:para2 and valid_cat = 1"
    category_tar = db.session.execute(text(sql),{'para':data['name'],'para2':rest_id}).fetchone()

    if category_tar is not None:
        return jsonify({'code': 404, 'message': "category name already exist"})
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
    
    # calculate index for category
    categories = Category.query.filter_by(r_id=rest_id).all()
    total_categories = len(categories)
    # add information for new category
    category = Category(name=data['name'], index=total_categories, r_id=rest_id)
    db.session.add(category)
    db.session.commit()
    return jsonify({'code': 200})


'''
   Get category which ask for deletion, if system is free and category 
   exist, then change it's valid_cat attribute to False

        Route : /categories/<id>

        Method : DELETE
            id   : int (Category id) 

        
        Returns:
            Example:
                {
                    "code":200

                }
'''

# delete category by search given category id
@bp.route('/categories/<id>', methods=['DELETE'])
def delete_category(id):
    # check if given category id is valid or not
    category = Category.query.filter_by(id=id).first()
    if not category:
        return jsonify({'code': 404, 'message': "category id does not exist"})
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

    # not allow delete categories when some customer using 
    if len(Table.query.filter(Table.r_id == category.r_id).all()) != len(Table.query.filter(Table.r_id == category.r_id,Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could delete categories when restaurant is free"})
    # not allow delete categories when some customer queuing
    if len(Queue.query.filter(Queue.r_id == category.r_id).all()) != 0:
        return jsonify({'code': 404, 'message': "some customer is queuing now, you could delete categories when restaurant is free"})
    # delete category and items related to this category
    Category.query.filter_by(id=id).update({"valid_cat": False})
    Item.query.filter_by(cat_id = id).update({"valid_item": False})
    db.session.commit()
    
    return jsonify({'code': 200})



'''
   Get categories with new infomation, if system is free and categories do not
   have duplicate indexes, then we update categories in database

        Route : /categories

        Method : PUT
            r_id : str (Restaurant id) 
            array (
                id   : int (Category id)
                name : str (Category name)
                int  : int (Category index)
            )
            

        Returns:
            Example:
                {
                    "code":200
                }
'''

# update category information
@bp.route('/categories', methods=['PUT'])
def update_categories():
    # check if given input valid or not
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
        if 'index' not in list(i.keys()) :
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
    
    # Checking for duplicate indexes before.
    update_ids = []
    for i in data:
        update_ids.append(i['id'])

    original_indexs = []
    categories = Category.query.filter_by(r_id=rest_id,valid_cat = 1).all()
    for i in categories:
        if i.id not in update_ids:
            original_indexs.append(i.index)
    for i in data:
        if i['index'] in original_indexs:
            return jsonify({'code': 400, 'message': "duplicate index"})

    # category names in a restaurant must be unique
    sql = "select * from category where binary name =:para and r_id =:para2 and valid_cat = 1"
    # checking if the categories can be updated and then we update it.
    for i in data:
        category = Category.query.filter_by(id = i['id']).first()
        if not category:
            return jsonify({'code': 400, 'message': "category does not exists"})
        if category.valid_cat == False:
            return jsonify({'code': 400, 'message': "category does not exists"})
        # not allow update categories when some customer using 
        if len(Table.query.filter(Table.r_id == rest_id).all()) != len(Table.query.filter(Table.r_id == rest_id, Table.status == EMPTY).all()):
            return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could update categories when restaurant is free"})
        # not allow update categories when some customer queuing
        if len(Queue.query.filter(Queue.r_id ==rest_id).all()) != 0:
            return jsonify({'code': 404, 'message': "some customer is queuing now, you could update categories when restaurant is free"})
        # category names in a restaurant must be unique
        category_tar = db.session.execute(text(sql),{'para':i['name'],'para2':rest_id}).fetchone()
        if category_tar is not None and category_tar.id != i['id']:
            return jsonify({'code': 404, 'message': "category name already exist"})
        # update category information
        category.name = i['name']
        category.index = i['index']
        db.session.commit()

   
    return jsonify({'code': 200})
