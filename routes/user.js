var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var ObjectId = require('mongodb').ObjectId;
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

// Trace User Score Update
router.post('/stats', urlencodedParser, function (req, res, next) {
    console.log('[POST /user/stats]\n',
        ' body =', req.body, '\n',
        ' host =', req.headers.host,
        ' user-agent =', req.headers['user-agent'],
        ' referer =', req.headers.referer);

    var userScore = parseInt(req.body.score, 10),
        userLevel = parseInt(req.body.level, 10),
        userLives = parseInt(req.body.lives, 10),
        userET = parseInt(req.body.elapsedTime, 10);

    Database.getDb(req.app, function (err, db) {
        if (err) {
            return next(err);
        }

        // Retrieve the current active span and create a child span
        const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active());

        if (activeSpan) {
            console.log("Adding span to the existing trace...");
        } else {
            console.log("No active trace found. Creating a new span.");
        }

        const span = tracer.startSpan("update-user-score", {
            attributes: {
                "user.score": userScore,
                "user.level": userLevel,
                "user.lives": userLives,
                "user.elapsedTime": userET
            }
        }, opentelemetry.context.active()); // Attach to the current trace context

        db.collection('userstats').updateOne({
            _id: new ObjectId(req.body.userId),
        }, {
            $set: {
                cloud: req.body.cloud,
                zone: req.body.zone,
                host: req.body.host,
                score: userScore,
                level: userLevel,
                lives: userLives,
                elapsedTime: userET,
                date: Date(),
                referer: req.headers.referer,
                user_agent: req.headers['user-agent'],
                hostname: req.hostname,
                ip_addr: req.ip
            },
            $inc: {
                updateCounter: 1
            }
        }, {
            w: 'majority',
            j: true,
            wtimeout: 10000
        }, function (err, result) {
            var returnStatus = '';

            if (err) {
                console.log(err);
                returnStatus = 'error';
                span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR, message: err.message });
            } else {
                console.log('Successfully updated user stats');
                returnStatus = 'success';
                span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
            }

            res.json({
                rs: returnStatus
            });

            // End the span
            span.end();
        });
    });
});

module.exports = router;
