// Imports the Google Cloud client libraries
const assert = require('assert');
const BigQuery = require('@google-cloud/bigquery');

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const projectId = process.argv[2];
const dataset = process.argv[3] || "fitness_data";
const table = process.argv[4] || "cdc_calorie_needs";

/**
 * TODO(developer): Replace the following lines with the path to your file.
 */
const filename = process.argv[5];

console.log(`Arguments: ${projectId}, ${dataset}, ${table}, ${filename}`);

// Instantiates clients
const bigquery = new BigQuery({
    projectId: projectId,
});


// Configure the load job. For full list of options, see:
// https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.load
const metadata = {
    sourceFormat: 'CSV',
    skipLeadingRows: 1,
    autodetect: true,
};

// Loads data from a Google Cloud Storage file into the table
bigquery
    .dataset(dataset)
    .table(table)
    .load(filename, metadata)
    .then(results => {
        const job = results[0];

        // load() waits for the job to finish
        assert.equal(job.status.state, 'DONE');
        console.log(`Job ${job.id} completed.`);

        // Check the job's status for errors
        const errors = job.status.errors;
        if (errors && errors.length > 0) {
            throw errors;
        }
    })
    .catch(err => {
        console.error('ERROR:', err);
    });