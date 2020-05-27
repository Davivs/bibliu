/*

var assert = require('assert');
var bibliu = require('../routes/bibliu');

let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');

let server = require('../app');
chai.use(chaiHttp);

describe('/GET bibliu', () => {
    it('it should GET one book', (done) => {
        chai.request(server)
            .get('/bibliu')
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.be.a('object');
                done();
            });
    });
});

*/