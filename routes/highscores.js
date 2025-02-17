var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Database = require('../lib/database');

// Import OpenTelemetry
const opentelemetry = require('@opentelemetry/api');
const tracer = require('../bin/entry'); // Import tracer from entry.js

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Middleware to log request time
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date());
    next();
});

router.get('/list', urlencodedParser, function(req, res, next) {
    console.log('[GET /highscores/list]');
    Database.getDb(req.app, function(err, db) {
        if (err) {
            return next(err);
        }

        var col = db.collection('highscore');
        col.find({}).sort([['score', -1]]).limit(10).toArray(function(err, docs) {
            var result = [];
            if (err) {
                console.log(err);
            }

            docs.forEach(function(item) {
                result.push({
                    name: item['name'],
                    cloud: item['cloud'],
                    zone: item['zone'],
                    host: item['host'],
                    score: item['score']
                });
            });

            res.json(result);
        });
    });
});

// Accessed at /highscores
router.post('/', urlencodedParser, function(req, res, next) {
    console.log('[POST /highscores] body =', req.body,
                ' host =', req.headers.host,
                ' user-agent =', req.headers['user-agent'],
                ' referer =', req.headers.referer);

    var userScore = parseInt(req.body.score, 10),
        userLevel = parseInt(req.body.level, 10);

    Database.getDb(req.app, function(err, db) {
        if (err) {
            return next(err);
        }

        // Retrieve current active context and start a child span
        const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active());

        if (activeSpan) {
            console.log("Adding span to the existing trace...");
        } else {
            console.log("No active trace found. Creating a new span.");
        }

        const span = tracer.startSpan("insert-highscore", {
            attributes: {
                "user.score": userScore,
                "user.level": userLevel,
            }
        }, opentelemetry.context.active()); // Attach to the current trace context

        db.collection('highscore').insertOne({
                name: req.body.name,
                cloud: req.body.cloud,
                zone: req.body.zone,
                host: req.body.host,
                score: userScore,
                level: userLevel,
                date: Date(),
                referer: req.headers.referer,
                user_agent: req.headers['user-agent'],
                hostname: req.hostname,
                ip_addr: req.ip
            }, {
                w: 'majority',
                j: true,
                wtimeout: 10000
            }, function(err, result) {
                var returnStatus = '';

                if (err) {
                    console.log(err);
                    returnStatus = 'error';
                    span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR, message: err.message });
                } else {
                    console.log('Successfully inserted highscore');
                    returnStatus = 'success';
                    span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
                }

                res.json({
                    name: req.body.name,
                    zone: req.body.zone,
                    score: userScore,
                    level: userLevel,
                    rs: returnStatus
                });

                // End the span
                span.end();
            });
    });
});

module.exports = router;
