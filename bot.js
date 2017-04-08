'use strict';

const request = require('request');
const excuse = require('huh');

// Facebook API settings
const fbApiVersion = '2.8';
const fbVerifyToken = process.env.FB_VERIFY_TOKEN;
const fbPageToken = process.env.FB_PAGE_TOKEN;

/**
 * Main lambda function handler
 */
const handler = exports.handler = (event, context, callback) => {

    // convenience function to respond with given payload. Optionally specify type
    const respond = (payload, type) => callback(null, {
        statusCode: 200,
        body: payload,
        headers: {'Content-Type': type || 'application/json'}
    });

    // convenience function to respond with given error message. statusCode defaults to 500
    const error = (message, statusCode) => callback(null, {
        statusCode: statusCode || 500,
        body: {error: message},
        headers: {'Content-Type': 'application/json'}
    });

    // fail function execution with an error message
    const fail = (message) => callback({message});

    // ensure we have a valid config
    if (!fbVerifyToken) return fail('Missing FB webhook verification token');
    if (!fbPageToken) return fail('Missing FB page token');

    console.log('received event:', event);
    console.log('context:', context);

    const qs = event.queryStringParameters;
    var body = null;

    if (event.body) {
        body = JSON.parse(event.body);
        console.log('event body:', body);
    }

    if (qs) {
        console.log('query string:', qs);
    }

    const verifyToken = () => {
        // we want to verify token
        console.log(`verifying token ${qs['hub.verify_token']}`);
        if (qs['hub.verify_token'] === fbVerifyToken) {
            console.log('token gud');
            respond(qs['hub.challenge'], 'text/plain');
        } else {
            error('Error, wrong validation token', 403);
            console.warn('token no gud');
        }
    };

    if (qs && qs['hub.mode'] === 'subscribe') {
        verifyToken();
    } else {
        // respond instantly, process message later
        respond('ok', 'text/plain');
    }

    if (!body) {
        console.info('No body, exiting');
        return;
    }

    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                if (event.message && event.message.text && !event.message.is_echo) {
                    sendMessage(event.sender.id, excuse.get('en'));
                }
            });
        });
    } else {
        console.warn('Invalid or missing object type in body', body);
    }
};

/**
 * Send simple text message to messenger api
 */
const sendMessage = (recipientId, messageText) => {
    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };
    callSendApi(messageData);
};

/**
 * Invoke FB send API with given payload
 */
const callSendApi = (messageData) => {
    const data = {
        uri: `https://graph.facebook.com/v${fbApiVersion}/me/messages`,
        qs: {access_token: fbPageToken},
        method: 'POST',
        json: messageData
    };

    console.log('Sending payload to messenger api: ', data);

    request(data, (err, response, body) => {
        if (err) {
            console.error('Error while sending request', err);
        } else if (response.statusCode !== 200) {
            console.error('Request failed, got status %s', response.statusCode, response.body);
        } else {
            console.log(
                'Successfully sent generic message with id %s to recipient %s',
                body.message_id,
                body.recipient_id
            );
        }
    });
};
