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
async function PushCurrentTemperature(document)
{
    let mongoClient;
    try {
        //mongodb connection
        mongoClient = await mongoDb.MongoClient.connect(mongoConnectionString, { useNewUrlParser: true});

        let collection = mongoClient.db("WeatherAPI").collection("CurrentTemperature");

        let query = {"TimeStamp" : document["TimeStamp"], "City" : document["City"], "CurrentTemperature" : document["CurrentTemperature"]};
        
        let result = await collection.countDocuments(query);

        if (result == 0) {
            await collection.insertOne(document,{forceServerObjectId:true});
        }

        console.log(document);
    }
    catch (exception) {
        
        throw exception;
    }
    finally {

        mongoClient.close();
    }
}


// Business Logic 
function TemperatureInCovilha()
{
    return new Promise((resolve, reject) => { 
        
        let url = 'http://api.openweathermap.org/data/2.5/weather?q=Covilha&units=metric&appid='+openWeatherKey ; 
    
        // get request to openweatherapi
        request(url, async (err, res, body) => {
            
            if (err) {

                //error response 
                responseJSON['StatusCode'] = "503";
                responseJSON['StatusDescription'] = "Service unavailable due to open weather map api, try again later";
            }

            // sucess response
            try {
        
                let data = JSON.parse(body);
                let timeStamp = data.dt;
                let document = {}

                document["CurrentTemperature"] = data.main.temp;
                document["City"] = data.name;
                document['Country'] = data.sys.country;
                document["TimeStamp"] = timeStamp;
                document["Unit"] = "°C";
                
                //push to DB
                await PushCurrentTemperature(document);


                document["DateTime"] = new Date(timeStamp * 1000).toISOString();                
                resolve(document);
            }
            catch(exception) {

                throw exception;
            }
        });
    });
}


// Endpoint
exports.lambdaHandler = async (event, context) => {

    try {
        responseJSON['data'] = await TemperatureInCovilha();
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
