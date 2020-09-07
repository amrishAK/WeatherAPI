// import modules
const request = require('request');
const mongoDb = require('mongodb');

// response variables
let lambdaResponse =  {'statusCode': 200,'body': ""};
var responseJSON = {"StatusCode" : "", "StatusDescription" : "", "data" : {}};
 
//keys
var openWeatherKey = 'bda303f1f07a96b6893a6ea2c9dbf40f';
var mongoConnectionString = "mongodb+srv://amrishAK:Su0q5jF6IlvEE4F8@testcluster.w1lq8.mongodb.net/test?retryWrites=true&w=majority";


// Data Access Function
async function GetAverageTemperature()
{
    let mongoClient;

    try {
        //mongodb connection
        mongoClient = await mongoDb.MongoClient.connect(mongoConnectionString, { useNewUrlParser: true});

        let collection = mongoClient.db("WeatherAPI").collection("AverageTemperature");

        let query = {"City" : "Sfax", "Month" : "June" };

        return await collection.findOne(query, {projection:{_id:0}});
    }
    catch (ex){
        throw ex;
    }
    finally{
        mongoClient.close();
    }
}


// Endpoint
exports.lambdaHandler = async (event, context) => {

    try {

        responseJSON['data'] = await GetAverageTemperature();
        responseJSON['StatusCode'] = "200";
        responseJSON['StatusDescription'] = "Sucess";        
    } 
    catch (exception) {

        responseJSON['StatusCode'] = "500";
        responseJSON['StatusDescription'] = "Internal exception due to " + exception;
    }
    
    lambdaResponse['body'] = JSON.stringify(responseJSON);
    return lambdaResponse;
};
