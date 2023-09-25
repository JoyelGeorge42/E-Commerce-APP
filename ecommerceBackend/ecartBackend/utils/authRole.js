
const catchAsyncErrors = require('../middlewere/catchAsyncErrors');
const ErrorHandeler = require('../utils/errorhandeler');
const jwt = require('jsonwebtoken');
const User = require('../model/user');


exports.autherizedRole = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new ErrorHandeler('Please login to access that page', 403));
      }
      next();
    };
  };
