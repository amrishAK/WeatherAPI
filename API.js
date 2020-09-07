// import module
var express = require("express");
var app = express();
var request = require("request");
var mongoDb = require('mongodb');

//response
var responseJSON = {"StatusCode" : "", "StatusDescription" : "", "data" : {}};


// keys
var openWeatherKey = 'bda303f1f07a96b6893a6ea2c9dbf40f';

var mongoConnectionString = "mongodb+srv://amrishAK:Su0q5jF6IlvEE4F8@testcluster.w1lq8.mongodb.net/test?retryWrites=true&w=majority";


// Data Access Functions ------

async function PushCurrentTemperature(document)
{
    let mongoClient;
    try{
        //mongodb connection
        mongoClient = await mongoDb.MongoClient.connect(mongoConnectionString, { useNewUrlParser: true});

        let collection = mongoClient.db("WeatherAPI").collection("CurrentTemperature");

        let query = {"TimeStamp" : document["TimeStamp"], "City" : document["City"], "CurrentTemperature" : document["CurrentTemperature"]};
        
        let result = await collection.countDocuments(query);

        if (result == 0){
            await collection.insertOne(document,{forceServerObjectId:true});
            console.log("document inserted!!");
            
        }
        else{
            console.log("docment already exists!!");
        }
    }
    catch (ex){
        throw ex;
    }
    finally{
        mongoClient.close();
    }
}


async function GetAverageTemperature()
{
    let mongoClient;
    try{
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


// Endpoint actions

var CovilhaCurrentTemperature = function TemperatureInCovilha(req, response, next){
    
    //Get request to openweather api
    let url = 'http://api.openweathermap.org/data/2.5/weather?q=Covilha&units=metric&appid='+openWeatherKey ; 
    
    // get request to openweatherapi
    request(url, async (err, res, body) => {
        
        if (err) {

            //error response 
            responseJSON['StatusCode'] = "503";
            responseJSON['StatusDescription'] = "Service unavailable due to open weather map api, try again later";
            response.send(responseJSON);
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

                responseJSON['StatusCode'] = "200";
                responseJSON['StatusDescription'] = "Sucess";
                responseJSON['data'] = document;

                response.send(responseJSON);
            }
            catch(exception) {

                responseJSON['StatusCode'] = "500";
                responseJSON['StatusDescription'] = "Internal exception due to " + exception;
                response.send(responseJSON);
            }
        });

        
}


var sfaxAverageTemperature = async function  AvgTemperatureInSfax(req, response, next){
    
    try {

        let data = await GetAverageTemperature();
        let avgTemperature = 0;
        responseJSON['StatusCode'] = "200";
        responseJSON['StatusDescription'] = "Sucess";
        responseJSON['data'] = data;
        // responseJSON['data']['AvgerageTemperature'] = avgTemperature;
        // responseJSON['data']['City'] = "Sfax";
        // responseJSON['data']['Country'] = "Tunisia";
        // responseJSON['data']['Month'] = "June";
        response.send(responseJSON);
    }
    catch (exception) {

        responseJSON['StatusCode'] = "500";
        responseJSON['StatusDescription'] = "Internal exception due to " + exception;
        response.send(responseJSON);
    }
}

var home = function(req,res){
    res.send("Weather API!!\n--> Current Temperature in Covilha url: http://0.0.0.0:8080/currenttempincovilha \n--> Average Temperature in Sfax in June url: http://0.0.0.0:8080/avgtempinsfax");
}

// Routes 
app.get("/",home);
app.get("/currenttempincovilha",CovilhaCurrentTemperature);
app.get("/avgtempinsfax",sfaxAverageTemperature);


app.listen(8080,"0.0.0.0",()=>{
    console.log("Weather API running in http://0.0.0.0:8080 \n--> Current Temperature in Covilha url: http://0.0.0.0:8080/currenttempincovilha \n--> Average Temperature in Sfax in June url: http://0.0.0.0:8080/avgtempinsfax");
});
