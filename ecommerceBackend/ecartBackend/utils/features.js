const { runInThisContext } = require("vm");

class Features{
    constructor(query,queryStr){
        this.query  = query;
        this.queryStr = queryStr;
    }
 //implementing search features 
 search(){
    const keyword = this.queryStr.keyword ? {
        name:{
        $regex:this.queryStr.keyword,
        $options:'i'
        }
    }:{}
    this.query = this.query.find({...keyword});
    return this
 }
 filter(){
    // if we directally assign this.queryStr to queryCopy then 
    // if we change here something it will change the original obj 
    // we will make first level copy and change it
    const queryCopy = {...this.queryStr}
    const removeFields = ['keyword','page','per_page'];
    removeFields.forEach(val=>delete queryCopy[val]);
    let querystr = JSON.stringify(queryCopy);
    querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g, (key)=>`$${key}`)
    this.query = this.query.find(JSON.parse(querystr));
    return this
 }
pagination(resultPerPage){
const currentPage = Number(this.queryStr.page) || 1
const skip = resultPerPage*(currentPage-1);
this.query = this.query.skip(skip).limit(resultPerPage);
return this
 }
}
module.exports = Features;
