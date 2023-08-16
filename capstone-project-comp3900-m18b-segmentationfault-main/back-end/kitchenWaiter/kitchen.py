from flask import Blueprint
from flask import  jsonify, request,session
from exts import db
from models import *
from macros import *
bp = Blueprint('staff_kitchen',__name__,)

'''
    
    Get the order_id and check it exists or not. After checking session, get the order by order_id. 
    If order's status is preparing, then kitchen staff will change it to ready_serve.
            Route: /finishPrepare
            
            Methods : POST
            
                order_id: int ("Order id")
            
            Returns:
                Example:
                    {
                      "code": 200,
                    }
'''

# used after kitchen cooked items and let waiter to serve
@bp.route('/finishPrepare', methods = ['POST'])
def finish_order():
    data = request.get_json()
    staff_id = session.get('staff_id')
    staff_role = session.get('role')

    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'order_id' not in list(data.keys()) or not data['order_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    # check session 
    if not staff_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not staff_role:
        return jsonify({'code': 400, 'message': "invalid params"})
    if staff_role != "kitchen" :
        return jsonify({'role': staff_role, 'code': 404, 'message': "staff has no access to do this operation"}) 


    orders = Order.query.filter_by(id=data['order_id']).first()
    # change order status from pareparing to ready to serve
    if orders.status == PREPARING:
        orders.status = READY_SERVE
        db.session.commit()
        return jsonify({'code': 200})
    else:
        return jsonify({'code': 400, 'message': "order status is not preparing"})

'''
    
    After checking session, get all the preparing orders and return orders' information.
            Route: /prepareQueue
            
            Methods : GET
            
            Returns:
                Example:
                    {
                      "code": 200,
                      "data": {
                        "id": 1,
                        "item_name" : "Fries",
                        "table_name" : "A3",
                        "quantity": 4
                      }
                    }
'''

# used when kitchen want to see all orders which are pareparing
@bp.route('/prepareQueue', methods = ['GET'])
def prepareQueue():
    staff_id = session.get('staff_id')
    staff_role = session.get('role')
    # check session 
    if not staff_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not staff_role:
        return jsonify({'code': 400, 'message': "invalid params"})
    if staff_role != "kitchen" :
        return jsonify({'role': staff_role, 'code': 404, 'message': "staff has no access to do this operation"}) 

    orders = Order.query.filter(Order.cooked_by == staff_id,Order.status == PREPARING)
    all_orders = []
    # get all pareparing orders details
    for order in orders:
        all_orders.append({'id': order.id, 'item_name': order.r_items.name, 'table_name': order.r_customer.r_table.name,'quantity': order.quantity})

    return jsonify({'code': 200, 'data': {'orders' : all_orders}})