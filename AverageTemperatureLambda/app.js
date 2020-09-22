// import modules
const mongoDb = require('mongodb');

// response variables
let lambdaResponse =  {'statusCode': 200,'body': ""};
var responseJSON = {"StatusCode" : "", "StatusDescription" : "", "data" : {}};
 
//keys
var openWeatherKey = '****';
var mongoConnectionString = "***";


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
    catch (exception){

        throw exception;
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
