const { google } = require('googleapis');
const templatePath = "gs://YOUR_BUCKETNAME/PATH/TO/TEMPLATE";
const dataset = "fitness_data";
const table = "apple_health";
const jobName = "apple-health";

exports.launchAppleHealthDataflowJob = function (event, callback) {
    const file = event.data;
    console.log("Enter");

    if (!file.name) {
        console.error("No file to update");
        callback();
        return;
    }

    console.log(`Using file \"gs://${file.bucket}/${file.name}\"`);

    google.auth.getApplicationDefault(function (err, authClient, projectId) {
        if (err) {
            throw err;
        }

        if (authClient.createScopedRequired && authClient.createScopedRequired()) {
            authClient = authClient.createScoped([
                'https://www.googleapis.com/auth/cloud-platform',
                'https://www.googleapis.com/auth/userinfo.email'
            ]);
        }

        const dataflow = google.dataflow({ version: 'v1b3', auth: authClient });
        const params = {
            projectId: projectId,
            gcsPath: templatePath,
            resource: {
                jobName: `${jobName}-${makeid()}`,
                parameters: {
                    input: `gs://${file.bucket}/${file.name}`,
                    output: `${dataset}.${table}`
                }
            }
        };

        console.log(`Launching template with params: ${JSON.stringify(params, null, 4)}`);

        dataflow.projects.templates.launch(params, function (err, response) {
            if (err) {
                console.error("Problem running dataflow template, error was: ", err);
                throw err;
            }

            console.log(`Dataflow job ${params.resource.jobName} launched successfully`);
            callback();
        });
    });
};

function makeid() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}