# Coming Soon

## Architecture 1

### Setup Pipeline
### 1. Create Buckets
* Template Bucket.
* Google Cloud Staging Bucket.
* Apple Health Bucket.

### 2. Create Cloud Function
Deploy function that listens to new objects in bucket
```bash
$ gcloud functions deploy launchAppleHealthDataflowJob \
  --stage-bucket fabio-architecture-1-gcf \
  --trigger-bucket fabio-architecture-1-apple-health
```

### 3. Create Dataflow Template
* Build and upload the template.
* Upload the template metadata.

### 4. Setup BigQuery
* Create a dataset called `fitness_data`
* Import CSV for CDC recommendations into BigQuery
```bash
cd bigquery
npm install
npm start interview-architecture-1 fitness_data cdc_calorie_needs ./cdc_calorie_needs_lookup.csv
npm start interview-architecture-1 fitness_data cdc_sleep_hours ./cdc_sleep_hours_lookup.csv
```

### 5. Copy Dashboard Template?

### Run Data Pipeline
* Open the google cloud function and start streaming logs.
* Open Dataflow and watch for a new job being created.
* Upload data to apple health bucket.
* Open Cloud Functions, click on logs, and click on Play button to see logs being streamed.
* Open dataflow and see job running.
* Open BigQuery and see data being populated.
* Open Datalab and start querying data.