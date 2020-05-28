var assert = require('assert');
var bibliu = require('../routes/bibliu');

let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');

let server = require('../app');
chai.use(chaiHttp);

describe('/GET bibliu', () => {
    it('it should get one book', (done) => {
        let param = 27;
        chai.request(server)
            .get(`/bibliu/${param}`)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.id.should.equal(param.toString());
                done();
            });
    });
});

describe('/GET bibliu book Id 1', () => {
    it('it should add the book with id 1 and check its title', (done) => {
        let param = 1;
        chai.request(server)
            .get(`/bibliu/${param}`)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.title.should.equal("The Declaration of Independence of the United States of America");
                done();
            });
    });
});

describe('/GET bibliu book Id 1', () => {
    it('it should try to add the book with id 1 again and fail as it has already been inserted', (done) => {
        let param = 1;
        chai.request(server)
            .get(`/bibliu/${param}`)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });
});

describe('/GET bibliu book Id 0', () => {
    it('it should get the book with id 0 and fail as it does not exist', (done) => {
        let param = 0;
        chai.request(server)
            .get(`/bibliu/${param}`)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });
});

describe('/GET bibliu book Id 7', () => {
    it('it should get the book with id 7 and test case without author', (done) => {
        let param = 7;
        chai.request(server)
            .get(`/bibliu/${param}`)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.authors.should.deep.equal([]);
                done();
            });
    });
});



