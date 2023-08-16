import os
from flask import Blueprint
from flask import jsonify, request
from exts import db
from models import *
from macros import *
bp = Blueprint('customer_orders',__name__,)


'''
    
    Find out all the orders for the customer, if the order has an image in the backend then return
    and http request for it otherwise set it to null and then loop through all the orders and find 
    the subtotal of it based on the quantity of each of the items and the return all the items with their
    details and the subtotal back to the frontend.
            
            Route: /orders
            
            Methods : GET
                
                customer_id : integer (Customer Id) 
                
            Returns:
            
                Example:
                
                     {
                      "code": 200,
                      "data": {
                        "items": [
                          {
                            "id": 14,
                            "item_id": 1,
                            "item_name": "Chicken Soup",
                            "item_price": 19,
                            "quantity": 1,
                            "status": 2,
                            "img_url": "http://localhost:5173/img/chicken_soup.jpg"
                          },
                          {
                            "id": 24,
                            "item_id": 2,
                            "item_name": "Spicy Soup",
                            "item_price": 16.66,
                            "quantity": 3,
                            "status": 1,
                            "img_url": "http://localhost:5173/img/chicken_soup.jpg"
                          }
                        ],
                        "subtotal": 155.43
                      }
                    }
                    
'''

@bp.route('/orders', methods=['GET']) 
def orders():
    # check if given input is valid or not
    c_id = request.args.get('customer_id')
    if not c_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Customer.query.filter_by(id=c_id).first():
        return jsonify({'code': 404, 'message': "customer id does not exist"})
    # collect orders for this customer
    orders = Order.query.filter_by(customer_id=c_id).all()
    all_orders = []
    subtotal = 0
    for order in orders:
        Img_http_request = ''
        # if given order has correspnding image, make image http request for it, otherwise return null for image url
        if order.r_items.img_url != None :
            try:
                file_dir = os.path.join(basedir, IMAGE_FOLDER)
                open(os.path.join(file_dir, '%s' % order.r_items.img_url), "rb")
                Img_http_request = f'http://127.0.0.1:5000/image?image={order.r_items.img_url}'
            except:
                order.r_items.img_url = None
                db.session.commit()
            
        all_orders.append(
            {'id': order.id, 'item_id': order.item_id, 'item_name': order.r_items.name, 'item_price': order.r_items.price,
             'quantity': order.quantity, 'status': order.status, 'img_url': Img_http_request})
        subtotal += order.r_items.price * order.quantity

    return jsonify({'code': 200, 'data': {'items' : all_orders, 'subtotal': subtotal}})




'''
    
    Check whether all the given items are valid or not, and then make the ordres in the backend 
    and update the stock of each of the items on the backend and if everything is successful
    then retrun a 200 code.
            
            Route: /orders
            
            Methods : POST
                
                customer_id : integer (Customer Id)
                items : array(
                            id : integer (Order id)
                            price : integer (Price of ordered item)
                            quantity : integer (quantity of the ordered item)
                        )
                
            Returns:
            
                Example:
                    
                    {
                      "code": 200
                    }
                     
                    
'''

@bp.route('/orders', methods=['POST'])
def create_order():
    # check given inputs are valid or not
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'customer_id' not in list(data.keys()) or not data['customer_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'items' not in list(data.keys()) or not data['items']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Customer.query.filter_by(id=data['customer_id']).first():
        return jsonify({'code': 404, 'message': "customer id does not exist"})

    items = data['items']
    restaurant = Customer.query.filter(Customer.id == data['customer_id']).first().r_res
    # check given items are valid or not
    for item in items:
        item_id = item['id']
        if not Item.query.filter_by(id=item_id).first():
            return jsonify({'code': 404, 'message': "item id does not exist"})
        item_check = Item.query.filter_by(id=item_id).first()
        if item_check.valid_item == False:
            return jsonify({'code': 400, 'message': "item does not exist"})
        if item_check.r_id != restaurant.id:
            return jsonify({'code': 400, 'message': "item does not belong to this customer's restaurant"})
        if str(item_check.price) != item['price']:
            return jsonify({'code': 400, 'message': "menu item info change"})
        if item_check.stock < item['quantity']:
            return jsonify({'code': 400, 'message': "out of stock"})
    # make orders 
    for item in items:
        item_id2 = item['id']
        item_update = Item.query.filter_by(id=item_id2).first()
        order = Order(customer_id=data['customer_id'], item_id=item['id'], quantity=item['quantity'])
        order.r_res = restaurant
        db.session.add(order)
        db.session.commit()
        item_update.stock = item_update.stock - item['quantity']
        db.session.commit()

    return jsonify({'code': 200})
