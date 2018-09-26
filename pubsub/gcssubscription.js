// Imports the Google Cloud client library
const PubSub = require(`@google-cloud/pubsub`);

// Creates a client
const pubsub = new PubSub();

/**
 * TODO(developer): Uncomment the following lines to run the sample.
 */
const topicName = 'projects/interview-architecture-1/topics/apple-health';
const subscriptionName = 'apple-health';

// Creates a new subscription
pubsub
    .topic(topicName)
    .createSubscription(subscriptionName)
    .then(results => {
        const subscription = results[0];
        console.log(`Subscription ${subscriptionName} created.`);
    })
    .catch(err => {
        console.error('ERROR:', err);
    });