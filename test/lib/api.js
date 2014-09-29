var mongoose = require("mongoose");
var pongbot = require("../../lib/app.js");
var superagent = require('superagent')
var expect = require('expect.js')
var pong = pongbot.pong;
var Player = pongbot.playerModel;

describe('help', function(){
  it('gets the help link', function(done){
    superagent.post('http://localhost:3000/')
      .send({
        user_name: 'test',
        text: 'pongbot help'
      })
      .end(function(e,res){
        expect(res.body.text).to.eql('https://github.com/andrewvy/opal-pongbot')
        done();
      })
  })
})

describe("new_season", function(){
  var p2 = null;
  beforeEach(function(done){
    process.env.ADMIN_NAME = 'admin_name'
    process.env.ADMIN_SECRET = 'admin_secret'

    new Player({user_name: 'worst', wins: 0, losses: 2, elo: 0, tau: 0}).save();
    p2 = new Player({user_name: 'middle', wins: 1, losses: 1, elo: 10, tau: 0});
    p2.save();
    new Player({user_name: 'best', wins: 2, losses: 0, elo: 20, tau: 0}).save();

    done();
  });

  afterEach(function(done){ //delete all the player records
    Player.remove({}, function() {
      done();
    });
  });

  it('clears all records when secret and user are correct', function(done){
    superagent.post('http://localhost:3000/')
      .send({
        user_name: 'admin_name',
        text: 'pongbot new_season admin_secret'
      })
      .end(function(e,res){
        expect(res.body.text).to.eql('Welcome to the new season.')
        Player.find({}).find( function(err, players) {
          if (err) return handleError(err);
          expect(players.length).to.eql(3);
          for (var i=0;i<players.length;i++) {
            expect(players[i].wins).to.eql(0);
            expect(players[i].losses).to.eql(0);
            expect(players[i].elo).to.eql(0);
          }
          done();
        })
      })
  })

  it('does not clear records when secret and user are incorrect', function(done){
    superagent.post('http://localhost:3000/')
      .send({
        user_name: 'foo',
        text: 'pongbot new_season bar'
      })
      .end(function(e,res){
        expect(res.body.text).to.eql('You do not have admin rights.')
        Player.where({user_name: p2.user_name}).findOne( function(err, user) {
          if (err) return handleError(err);
          expect(user.wins).to.eql(1);
          expect(user.losses).to.eql(1);
          expect(user.elo).to.eql(10);
          done();
        })
      })
  })
});

