class ErrorHandeler extends Error{
//here Error is default class for Error Handeling in node.js
constructor(message,statusCode){
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this,this.constructor)
}
}
module.exports = ErrorHandeler;