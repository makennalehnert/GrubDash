const e = require("express");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id is not found: ${dishId}`,
  });
}

function bodyHasNameProperty(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a name",
  });
}

function bodyHasDescriptionProperty(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a description",
  });
}

function bodyHasPriceProperty(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a price",
  });
}

function priceIsValid(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (typeof price == "number" && price > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must have a price that is an integer greater than 0",
  });
}

function bodyHasImageProperty(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url",
  });
}

function validId(req, res, next) {
  if (
    !req.body.data.id ||
    req.body.data.id === "" ||
    req.body.data.id === null ||
    req.body.data.id === undefined ||
    req.body.data.id === res.locals.dish.id
  ) {
    return next();
  } else if (req.params.dishId !== req.body.data.id) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${req.params.dishId}`,
    });
  }
}

function list(req, res, next) {
  res.json({ data: dishes });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function create(req, res, next) {
  const { data: { name } = {} } = req.body;
  const { data: { description } = {} } = req.body;
  const { data: { price } = {} } = req.body;
  const { data: { image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function update(req, res, next) {
  const dish = res.locals.dish;
  const originalName = dish.name;
  const originalDesc = dish.description;
  const originalImage = dish.image_url;
  const originalPrice = dish.price;
  const { name, description, image_url, price } = req.body.data;

    dish.name = name;
    dish.description = description;
    dish.image_url = image_url;
    dish.price = price;

  res.json({ data: dish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasPriceProperty,
    priceIsValid,
    bodyHasImageProperty,
    create,
  ],
  update: [
    dishExists,
    validId,
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasPriceProperty,
    priceIsValid,
    bodyHasImageProperty,
    update,
  ],
};
