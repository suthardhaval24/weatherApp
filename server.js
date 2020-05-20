var express = require('express')
var request = require('request-promise');
var mongoose = require('mongoose');
var bodyParser =require('body-parser');

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
//replace username and password field
var uri = "mongodb+srv://user:<password>@cluster0-gjhz9.mongodb.net/weather_cities?authSource=admin&retryWrites=true&w=majority";
mongoose.connect(uri,{ useNewUrlParser: true });


var citySchema = new mongoose.Schema({
    name: String
});

//dat acreation
var cityModel = mongoose.model('City', citySchema);

//get cities from DB
async function getWeather(cities) {

    var weather_data = [];

    for (var city_obj of cities) {
        var city = city_obj.name;
        var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=271d1234d3f497eed5b1d80a07b3fcd1`;
        var res_body = await request(url);
        var weather_json = JSON.parse(res_body);

        var weather = {
            city: city,
            temperature: Math.round(weather_json.main.temp),
            description: weather_json.weather[0].description,
            icon: weather_json.weather[0].icon
        }

        weather_data.push(weather);
    }
    return weather_data;

}


var cityModel = mongoose.model('City', citySchema);



app.get('/', function (req, res) {
    cityModel.find({}, function (err, cities) {
        getWeather(cities).then(function(results){
            // console.log( results);
            var weather_data = {weather_data:results};
            res.render('app', weather_data);
        });
    });
});

app.post('/',function(req,res){
    var newCity = new cityModel({name: req.body.city_name});
    newCity.save();
    res.redirect('/');
});

app.listen(8000);