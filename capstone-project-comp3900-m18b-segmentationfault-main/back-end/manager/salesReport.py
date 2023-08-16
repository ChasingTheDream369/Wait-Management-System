from flask import Blueprint
from flask import jsonify, request
from exts import db
from models import *
import datetime 
from sqlalchemy import text
bp = Blueprint('manager_salesreport',__name__,)

'''
   Get restaurant sales report, 

        Route : /sales_report

        Method : GET
            r_id : str (Restaurant id) 
            

        Returns:
            Example:
                {
                "code": 200,
                "data": {
                            "restaurant_name": "MkDonuts",
                            "total_customers": 12345,
                            "total_items_cooked": 234567,
                            "total_income": "3456789.01",
                            "customer_average_cost": "24.63",
                            "total_categories": 12,
                            "total_dishes": 154,
                            "total_staff": 34,
                            "total_tables": 25,
                            "annual_sales": [
                                {
                                    "month": 10,
                                    "sales": 1234
                                },
                                ...
                            ],
                            "sales_by_categories": [
                                {
                                    "name": "Burger",
                                    "sales": 1234
                                },
                                ...               
                            ],
                            "customers_weekly": [
                                150,
                                ...
                            ]
                        }
                }
'''

@bp.route('/sales_report', methods=['GET'])
def sale_report():
    # check if given input is valid or not
    restaurant_id = request.args.get('r_id',type=int)
    if not restaurant_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=restaurant_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"}) 

    restaurant = Restaurant.query.filter_by(id=restaurant_id).first()
    # annual_sales
    annual_result = calculate_annual_sales(restaurant_id)
    #print(annual_result)

    # weekly_customer
    weekly_result = calculate_weekly_customer(restaurant_id)
    #print(weekly_result)

    #total customers
    total_customers = 0
    customers = Customer.query.filter_by(r_id=restaurant_id).all()
    for customer in customers:
        total_customers = total_customers + customer.num_peop

    #total tables
    tables = Table.query.filter_by(r_id=restaurant_id).all()
    total_tables = len(tables)

    #total_item_cooked
    total_items_cooked = 0
    orders = Order.query.filter(Order.r_id==restaurant_id,Order.status >= 2).all()
    for order in orders:
        total_items_cooked = total_items_cooked + order.quantity
    
    #total income
    total_income = 0
    orders = Order.query.filter_by(r_id=restaurant_id).all()
    for order in orders:
        total_income += order.r_items.price * order.quantity
    
    #customer average cost
    if total_customers == 0:
        customer_average_cost = 0
    else:
        customer_average_cost = total_income / total_customers

    #total categories
    categories = Category.query.filter_by(r_id=restaurant_id,valid_cat=True).all()
    total_categories = len(categories)

    #total dishes
    items = Item.query.filter_by(r_id=restaurant_id,valid_item=True).all()
    total_dishes = len(items)

    #total staff
    staffs = Staff.query.filter_by(r_id=restaurant_id,login_permission=1).all()
    total_staffs = len(staffs)

    #sales by categories
    sales_categories = sales_by_categories(restaurant_id)
    


    return jsonify({'code': 200, 'data': {'restaurant_name' : restaurant.name, 'total_customers': total_customers, 'total_items_cooked':total_items_cooked,
    'total_income':total_income, 'customer_average_cost':customer_average_cost, 'total_categories':total_categories, 'total_dishes':total_dishes, 'total_staff':total_staffs, 
    'total_tables':total_tables,'annual_sales':annual_result, 'sales_by_categories':sales_categories, 'customers_weekly':weekly_result}})

###################################################################################################
#                                  HELPER FUNCTIONS                                               #
###################################################################################################

# calculate annual sales from given restaurant
def calculate_annual_sales(restaurant_id):
    # get current year and month, calculate the endtime for annual_sales
    this_year = datetime.datetime.now().year
    this_month = datetime.datetime.now().month
    endtime = datetime.datetime(this_year, this_month, 1)
    # get last year and start time for annual_sales
    targetYear =  (int (this_year)) - 1
    starttime = datetime.datetime(targetYear, this_month, 1)
    # get statistic from DB
    sql1 = "SELECT extract(MONTH FROM creat_time) AS `month`,sum(quantity) AS `sales` FROM `order` WHERE r_id=:rid AND creat_time>=:starttime AND creat_time<:endtime GROUP BY `month` ORDER BY `month`"
    result = db.session.execute(text(sql1),{'rid':restaurant_id,'starttime':starttime,'endtime':endtime}).fetchall()
    # append the month which does not appear from DB query result
    month = []
    for i in result:
        month.append(i[0])
    for i in range(1,13):
        if i not in month:
            result.append((i,0))
    new = sorted(result, key=lambda x: x[0])
    origin = [1,2,3,4,5,6,7,8,9,10,11,12]
    final_sales = []
    # change index order for month
    for i in range(12):
        index = (int(this_month) + i) % 12
        final_sales.append(new[origin[index] -2])
    return_value = []
    # output total sales for a month after sorting
    for i in final_sales:
        return_value.append({"month":i[0],"sales":int(i[1])})
    return return_value

# display total customers in a week
def calculate_weekly_customer(restaurant_id):
    # get statistic from DB
    sql2 = "SELECT DAYOFWEEK( checkin_time ) AS `day`, SUM( num_peop ) / COUNT(DISTINCT (substring(checkin_time, 1, 10))) AS `avg_customers` FROM customer WHERE r_id =:rid GROUP BY `day` ORDER BY `day`"
    result2 = db.session.execute(text(sql2),{'rid':restaurant_id}).fetchall()
    # append the day which does not appear from DB query result
    count = []
    for i in result2:
        count.append(i[0])
    for i in range(1,8):
        if i not in count:
            result2.append((i,0))
    weekly = sorted(result2, key=lambda x: x[0])
    return_value = []
    # output total customers after sorting
    for i in weekly:
        return_value.append((i[1]))
    return return_value

# display sales for every category
def sales_by_categories(restaurant_id):
    # get statistic from DB
    sql3 = "SELECT sum(`order`.quantity) AS sales,category.name,category.valid_cat FROM `order` LEFT JOIN item ON `order`.item_id=item.id LEFT JOIN category ON item.cat_id=category.id WHERE `order`.r_id=:rid GROUP BY cat_id ORDER BY sales DESC LIMIT 8"
    result3 = db.session.execute(text(sql3),{'rid':restaurant_id}).fetchall()
    return_value = []
    # output all name and sale for categories
    for i in result3:
        # if statistic is about some deleted categories, we mark it as deleted 
        if i.valid_cat == False:
            return_value.append({"name":i[1] + ' [DELETE]',"sales":int(i[0])})
        else:
            return_value.append({"name":i[1],"sales":int(i[0])})
    return return_value
