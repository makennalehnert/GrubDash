const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id is not found: ${orderId}`,
  });
}

function hasValidProperties(req, res, next) {
  const { data } = req.body;
  const requiredFields = ["deliverTo", "mobileNumber", "dishes"];
  for (const field of requiredFields) {
    if (!data[field]) {
      return next({
        status: 400,
        message: `Order must include a ${field}`,
      });
    }
  }
  next();
}


function hasValidPropertiesForUpdate(req, res, next) {
    const { data } = req.body;
    const requiredFields = ["deliverTo", "mobileNumber", "dishes", "mobileNumber", "status"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return next({
          status: 400,
          message: `Order must include a ${field}`,
        });
      }
    }
    next();
  }

function validDish(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  if (!Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  next();
}

function validQuantity(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  dishes.forEach(({quantity}, index) => {
  if (!quantity || quantity === "" || quantity < 1 || typeof quantity != "number") {
    return next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  }
  
})
next();
}

function validId(req, res, next) {
    if (
        !req.body.data.id ||
        req.body.data.id === "" ||
        req.body.data.id === null ||
        req.body.data.id === undefined ||
        req.body.data.id === res.locals.order.id
      ){
          return next()
      }
    
    if (req.params.orderId !== req.body.data.id) {
        return next({
          status: 400,
          message: `Order id does not match route id. Dish: ${req.body.data.id}, Route: ${req.params.dishId}`,
        });
      }
  }

function orderStatus(req, res, next){
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id == orderId); 
    const orderStatus = req.body.data.status
    if(!orderStatus || orderStatus === '' || !'pending preparing out-for-delivery delivered'.includes(orderStatus)){
        return next({
            status: 400,
            message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
        })
    }
    if(orderStatus === 'delivered'){
        return next({
            status:400,
            message: 'A delivered order cannot be changed'
        })
    }
    next();
}

function list(req, res, next) {
  res.json({ data: orders });
}

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const { id, name, description, image_url, price, quantity = {} } = dishes[0];

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes: [
      {
        id,
        name,
        description,
        image_url,
        price,
        quantity,
      },
    ],
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId); 
  if (orders[index].status === "pending") {
    orders.splice(index, 1);
    res.sendStatus(204);
  } else {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
}

function update(req, res, next){
  const order = res.locals.order
  const originalDeliverTo = order.deliverTo;
  const originalNumber = order.mobileNumber;
  const originalStatus = order.status;
  const originalDishes = order.dishes;
  const { deliverTo, mobileNumber, status, dishes } = req.body.data;
  const { id, name, description, image_url, price, quantity = {} } = dishes[0];

    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.status = status
    order.dishes = dishes
    order.dishes[0].id = id
    order.dishes[0].quantity = quantity
    order.dishes[0].name = name;
    order.dishes[0].description = description;
    order.dishes[0].image_url = image_url;
    order.dishes[0].price = price;

  res.json({ data: order });
}

module.exports = {
  list,
  create: [hasValidProperties, validDish, validQuantity, create],
  read: [orderExists, read],
  delete: [orderExists, destroy],
  update: [orderExists, hasValidPropertiesForUpdate, validDish, validQuantity, validId, orderStatus, update]
};
