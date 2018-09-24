const { google } = require('googleapis')

exports.fabioArchitecture1GCFn = function (event, callback) {
    const file = event.data;
    console.log("Enter");
    console.log(`Using file: ${JSON.stringify(file, null, 4)}`);

    // file.resourceState === 'exists'
    if (!file.name) {
        console.error("No file to update");
        callback();
        return;
    }

    console.log("File exists");
    google.auth.getApplicationDefault(function (err, authClient, projectId) {
        if (err) {
            throw err;
        }
        console.log("No auth errors");

        if (authClient.createScopedRequired && authClient.createScopedRequired()) {
            console.log("Getting scope?");
            authClient = authClient.createScoped([
                'https://www.googleapis.com/auth/cloud-platform',
                'https://www.googleapis.com/auth/userinfo.email'
            ]);
        }

        console.log("Got scope");
        const dataflow = google.dataflow({ version: 'v1b3', auth: authClient });
        const params = {
            projectId: projectId,
            gcsPath: 'gs://fabio-architecture-1/templates/apple-health-template',
            resource: {
                jobName: `cloud-fn-dataflow-apple-health-${makeid()}`,
                parameters: {
                    input: `gs://${file.bucket}/${file.name}`,
                    output: `fitness_data.apple_health`
                }
            }
        };

        console.log(`Launching template with params: ${JSON.stringify(params, null, 4)}`);

        dataflow.projects.templates.launch(params, function (err, response) {
            if (err) {
                console.error("problem running dataflow template, error was: ", err);
            }
            console.log("Dataflow template response: ", response);
            callback();
        });
    });
};

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
