var Promise = require('bluebird');
var MongoClient = require('mongodb').MongoClient;
var userHandler = require("./userHandler");
var leagueHandler = require("./leagueHandler");
var squadHandler = require("./squadHandler");
var teamsHandler =  require("./teamsHandler");
var bucketHandler = require("./bucketHandler");
var gameManager = require("./gameManager");
var db;

// Connect to the db
MongoClient.connect("mongodb://Serge:5958164se@ds063889.mongolab.com:63889/tapmanagerdb", function(err, data) {
//MongoClient.connect("mongodb://localhost:27017", function(err, data) {
    if (!err) {
        console.log("We are connected");
    } else {
        console.log(err);
    }
    db = data;
    squadHandler.setup(db);
    userHandler.setup(db);
    teamsHandler.setup(db);
    bucketHandler.setup(db);
    leagueHandler.setup(db);
    gameManager.setup(db).then(function(data){
        console.log("gameManager.setup","ok");
    });

});

var gameManagerSetup = function gameManagerSetup(){
    gameManager.setup(db);
}

var deleteDB = function deleteDB(){
    gameManager.deleteDB();
    teamsHandler.deleteDB();
    squadHandler.deleteDB();
    bucketHandler.deleteDB();
    userHandler.deleteDB();
}

var loginUser = function loginUser (user,res){
    userHandler.loginUser(user).then(function(data){
        res.send(data);
    });
}

var addNewUser = function addNewUser (user,res){
    userHandler.addNewUser(user).then(function(data){
        res.send(data);
    });
}

var addNewBucket = function addNewBucket(req,res){
    bucketHandler.addNewBucket(req.body.id);
}


var getUserById = function getUserById (user,res){
    //console.log(user);
    userHandler.getUserById(user,res).then(function(data){
        console.log(data.user);
        res.send(data.user);
    });
}

var updateUser = function updateUser(id,Key,value,res){
    userHandler.updateUser(id,Key,value).then(function(data){
        res.send(data);
    });
}

var addNewTeam = function addNewTeam (team,res){
    teamsHandler.addNewNumTeam(20).then(function(data){
        res.send(data);
    });
}

var getBotTeam = function getBotTeam(req,res){
    teamsHandler.getBotTeam().then(function(data){
        res.send(data);
    })
}
var getBotSquad = function getBotSquad(req,res){
    squadHandler.getBotSquad().then(function(data){
        res.send(data);
    })
}

 var newUser = function newUser(details,res){
     var results = [];
     results.push(userHandler.addNewUser(details));
     results.push(teamsHandler.newTeamUser(details));
     results.push(bucketHandler.addNewBucket(details));
     results.push(squadHandler.newSquadForUser(details));
     Promise.all(results).then(function(data){

         res.send("ok");
     })
 }


var getInfoById = function getInfoById(id){
    var defer = Promise.defer();
    var results = [];
    results.push(userHandler.getUserById(id));
    results.push(teamsHandler.getTeamById(id));
    results.push([]);
    results.push(bucketHandler.getBucketById(id));
    results.push(squadHandler.getSquadById(id));
    results.push(gameManager.getSetup());
    results.push(gameManager.getTimeTillNextMatch());
    results.push(gameManager.getOpponentById(id));
    Promise.all(results).then(function(data){
        var json = {};
        json["user"] = data[0];
        json["team"] = data[1].team;
        json["bucket"] = {details:data[3],timeNow: Date.now()};
        json["squad"] = data[4];
        json["settings"] = data[5].pricesAndMultipliers;
        json["timeTillNextMatch"] = data[6];
        json["nextMatch"] = data[7];

        teamsHandler.getTeamsInLeague(data[1].team.league).then(function (leagueData){
            json["league"] = leagueData;
            defer.resolve(json)
        })
        ;
        //console.log(json);
    })
    return defer.promise;
}

var getTeamsInLeague = function getTeamsInLeague(){
    teamsHandler.getTeamsInLeague().then(function(data){
        data.forEach(function(team){
        })
    });
}

var addNewBotSquad = function addNewBotSquad(req,res){
    squadHandler.addNewBotSquad().then(function(data){
        res.send(data);
    });
}

var addValueToTeam = function addValueToTeam(req,res){
    var json = JSON.parse(req);
    teamsHandler.addValueToTeam(json.id,json.key,json.value).then(function(data){
        res.send(data);
    })
}

var generateFixtures = function generateFixtures(req,res){
    teamsHandler.generateFixtures().then(function(data){
        res.send(data.fixutres);
    });
}

var getTeamByFixtureAndMatch = function getTeamByFixtureAndMatch(req,res){
    console.log(gameManager.getTeamByFixtureAndMatch(19,0,false));
}

var executeNextFixture = function executeNextFixture(req,res){
    gameManager.executeNextFixture(res);
}

var addCoinMoney = function addCoinMoney(req,res){
    userHandler.addCoinMoney(req.body.id,req.body.clicks).then(function(data){
        res.send(data);
    });
}

var boostPlayer = function boostPlayer(req,res){
    squadHandler.boostPlayer(req.body.id,req.body.playerId).then(function(data){
       res.send(data);
    });
}

var upgradeItem = function upgradeItem(req,item,res){
    userHandler.upgradeItem(req.body.id,item).then(function(data){
        res.send(data);
    })
}
var getTimeTillNextMatch = function getTimeTillNextMatch(res){
    res.send({time: gameManager.getTimeTillNextMatch()});

}

var addMoneyToUser = function addMoneyToUser(req,res){
    userHandler.addMoneyToUser(req.body.id,parseInt(req.body.money)).then(function(data){
        res.send(data);
    });
}

var collectBucket = function collectBucket(req,res){
    bucketHandler.collectNowBucket(req.body.id).then(function(data){
        res.send(data);
    });
}

module.exports.deleteDB = deleteDB;
module.exports.collectBucket = collectBucket;
module.exports.addMoneyToUser = addMoneyToUser;
module.exports.getTimeTillNextMatch = getTimeTillNextMatch;
module.exports.upgradeItem = upgradeItem;
module.exports.boostPlayer = boostPlayer;
module.exports.executeNextFixture = executeNextFixture;
module.exports.addCoinMoney = addCoinMoney;
module.exports.getTeamByFixtureAndMatch = getTeamByFixtureAndMatch;
module.exports.generateFixtures = generateFixtures;
module.exports.addValueToTeam = addValueToTeam;
module.exports.addNewBotSquad = addNewBotSquad;
module.exports.getInfoById = getInfoById;
module.exports.addNewUser = addNewUser;
module.exports.getUserById = getUserById;
module.exports.updateUser = updateUser;
module.exports.addNewTeam = addNewTeam;
module.exports.getBotTeam = getBotTeam;
module.exports.getBotSquad = getBotSquad;
module.exports.newUser = newUser;
module.exports.getTeamsInLeague = getTeamsInLeague;
module.exports.addNewBucket = addNewBucket;
module.exports.loginUser = loginUser;

module.exports.gameManagerSetup = gameManagerSetup;