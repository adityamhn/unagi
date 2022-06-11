const UserModel = require("../models/User.model");
const OrderModel = require("../models/Order.model");
const RestaurantModel = require("../models/Restaurant.model");
const ItemModel = require("../models/Item.model");
const TableModel = require("../models/Table.model");
const jwt = require("jsonwebtoken");

exports.GetAllUsers = (req, res, next) => {
  return UserModel.find({})
    .then((users) => {
      return res.status(200).json({
        success: true,
        users,
      });
    })
    .catch((err) => {
      console.log("error");
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Unknown server error!",
      });
    });
};

exports.SignUp = async (req, res, next) => {
  const { phoneNumber, name, password } = req.body;

  const phoneNumberCheck = await UserModel.find({
    phoneNumber,
  });
  const newUser = new UserModel({ phoneNumber, name, password });
  console.log("new user", newUser);
  newUser
    .save()
    .then(async (n) => {
      return res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      console.log("Error!");
      console.log(err);
      return res.status(500).json({
        success: false,
        message: err,
      });
    });
};

exports.GetUserDetails = (req, res, next) => {
  const { phoneNumber } = res.locals;
  if (!phoneNumber)
    return res.status(500).json({
      success: false,
      message: "Required values not provided!",
    });
  return UserModel.findOne({
    phoneNumber,
  })
    .then((user) => {
      return res.status(200).json({
        success: true,
        user: user,
      });
    })
    .catch((err) => {
      console.log("error");
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Unknown server error!",
      });
    });
};

// Add to cart
exports.AddToCart = async (req, res, next) => {
  const { _id, item_id } = req.body;
  if (!_id || !item_id)
    return res.status(500).json({
      success: false,
      message: "Required values not provided!",
    });
  const user = await UserModel.findById({
    _id,
  });
  if (!user)
    return res.status(500).json({
      success: false,
      message: "User not found!",
    });

  const item = await ItemModel.findById({
    _id: item_id,
  });
  if (!item)
    return res.status(500).json({
      success: false,
      message: "Item not found!",
    });
  user.cart.push(item);
  await user
    .save()
    .then(async () => {
      console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      return res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      console.log("Error");
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Unknown server error!",
      });
    });
};

//Turn Cart to order
exports.ConfirmCart = async (req, res, next) => {
  const uid = res.locals.uid;
  if (!uid)
    return res.status(500).json({
      success: false,
      message: "Required values not provided!",
    });

  const table = await TableModel.findOne({
    u_id: uid,
  });

  const user = await UserModel.findById({
    _id: uid,
  });

  table.orders = user.cart;
  user.orders.push(user.cart);
  user.cart = [];
  console.log("Done");
  await user.save();
  await table
    .save()
    .then(async (n) => {
      return res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      console.log("Error!");
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Unknown server error.",
      });
    });
};
