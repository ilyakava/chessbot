var mongoose = require("mongoose");
var pongbot = require("../../lib/app.js");
var pong = pongbot.pong;
var Player = pongbot.playerModel;

describe("userToS", function(){
  var currentUser = null;
  beforeEach(function(done){
    pong.registerPlayer("test", function() {
      pong.findPlayer("test", function(user) {
        currentUser = user;
        done();
      })
    });
  });

  afterEach(function(done){ //delete all the player records
    Player.remove({}, function() {
      done();
    });
  });

  it("prints a newly registered user correctly", function(done){
    var string = pong.userToS(currentUser)
    string.should.equal("test: 0 wins 0 losses (elo: 0)");
    done();
  });
});

describe("playersToS", function(){
  var sortedPlayers = null;
  beforeEach(function(done){
    var worst = new Player({user_name: 'worst', wins: 0, losses: 2, elo: 0, tau: 0});
    var middle = new Player({user_name: 'middle', wins: 1, losses: 1, elo: 10, tau: 0});
    var best = new Player({user_name: 'best', wins: 2, losses: 0, elo: 20, tau: 0});
    sortedPlayers = [best, middle, worst];

    done();
  });

  it("prints a leaderboard correctly", function(done){
    var string = pong.playersToS(sortedPlayers);
    string.should.equal("1. best: 2 wins 0 losses (elo: 20)\n2. middle: 1 win 1 loss (elo: 10)\n3. worst: 0 wins 2 losses (elo: 0)\n");
    done();
  });

  it("prints a leaderboard with ties correctly", function(done){
    sortedPlayers = sortedPlayers.concat(sortedPlayers[2]);
    sortedPlayers = [sortedPlayers[0]].concat(sortedPlayers);

    var string = pong.playersToS(sortedPlayers);
    string.should.equal("1. best: 2 wins 0 losses (elo: 20)\n1. best: 2 wins 0 losses (elo: 20)\n3. middle: 1 win 1 loss (elo: 10)\n4. worst: 0 wins 2 losses (elo: 0)\n4. worst: 0 wins 2 losses (elo: 0)\n");
    done();
  });
});

describe("getDuelGif", function(){
  it("doesn't return the same gif 3 times in a row", function(done){
    pong.getDuelGif(function(a){
      pong.getDuelGif(function(b){
        pong.getDuelGif(function(c){
          (a == b && b == c).should.equal(false);
          done();
        })
      })
    })
  });
});