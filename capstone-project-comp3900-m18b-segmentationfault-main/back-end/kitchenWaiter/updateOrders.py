from flask import Blueprint
from flask import  jsonify, request,session
from exts import db
from models import *
import datetime
from macros import *
bp = Blueprint('staff_orders',__name__,)

'''
    
    After checking r_id and session, all ready_prepare orders are sorted by creat_time 
    and kitchen can get these orders' information. Waiter can get all ready_serve 
    orders' information.
            Route: /prepareQueue
            
            Methods : GET
            
                r_id: int ("Restaurant id")

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

# used when kitchen and waiter want to see orders 
@bp.route('/orderStaff', methods = ['GET'])
def get_orders():
    restaurant_id = request.args.get('r_id')
    role = session.get('role')

    if not restaurant_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not role:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=restaurant_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"}) 
    
    if role != "kitchen" and role != "waiter":
        return jsonify({'role': role, 'code': 404, 'message': "role does not exist"}) 

    orders = []
    if role == 'kitchen':
        # get all orders after customers adding some orders
        orders = Order.query.filter_by(r_id = restaurant_id, status = READY_PREPARE).order_by((Order.creat_time)).all()
    if role == 'waiter':
        # get all orders when food is ready to serve
        orders = Order.query.filter_by(r_id = restaurant_id, status = READY_SERVE).all()

    # get orders details
    all_orders = []
    for order in orders:
        all_orders.append({'id': order.id, 'item_name': order.r_items.name, 'table_name': order.r_customer.r_table.name,'quantity': order.quantity})

    return jsonify({'code': 200, 'data': {'orders' : all_orders}})

'''
    
    After checking order_id and session, all ready_prepare orders will be changed to 
    preparing by kitchen. kitchen can update these orders' information. All ready_serve
    orders will be changed to completed by waiter. Waiter can update these orders' information.
            Route: /updateOrder
            
            Methods : POST

                order_id: int ("Order id")
            
            Returns:
                Example:
                    {
                      "code": 200
                    }
'''

# used when kitchen or waiter want to update order status
@bp.route('/updateOrder', methods = ['POST'])
def update_order():
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
    if staff_role != "kitchen" and staff_role != "waiter":
        return jsonify({'role': staff_role, 'code': 404, 'message': "staff has no access to do this operation"}) 

    staff = Staff.query.filter_by(id = staff_id).first()
    orders = Order.query.filter_by(id=data['order_id']).first()
    # after customer add orders, order status should be ready prepare, kitchen has access to change that
    if orders.status == READY_PREPARE and staff_role == "kitchen":
        prepared =  Order.query.filter(Order.cooked_by == staff_id, Order.status == PREPARING).all()
        total_quantity = 0
        # count all pareparing orders
        for i in prepared:
            total_quantity += i.quantity
        if total_quantity >= 5:
            return jsonify({'code': 400, 'message': "you exceed maxmium order that you can take"})
        # update next status and information
        orders.status = PREPARING
        orders.r_cook = staff
        orders.last_modified = datetime.datetime.now()
        db.session.commit()
        return jsonify({'code': 200})
    if orders.status == PREPARING and staff_role == "kitchen":
        return jsonify({'code': 400, 'message': "this order has been taken by other kitchen staff"})
    # after kitchen cooked items, waiter has access to change order status
    if orders.status == READY_SERVE and staff_role == "waiter":
        # update next status and information
        orders.status = COMPLETED
        orders.r_serve = staff
        orders.last_modified = datetime.datetime.now()
        db.session.commit()
    
    return jsonify({'code': 200})