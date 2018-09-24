import argparse
import csv
import datetime
import logging
import os
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions
from apache_beam.io.textio import ReadFromText

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LineToBigQueryRow(beam.DoFn):

    def process(self, element):

        # Parse single CSV line
        # Using this because there are row values with quotes and commas
        # A simple split(",") would not have worked properly
        items = list(csv.reader([element]))[0]

        #logger.info(element)
        #logger.info(items)

        result = [{
            'memberId': items[0],
            'hoursSleep': int(items[7]),
            'caloriesConsumed': int(items[8]),
            'caloriesBurned': int(items[9]),
            #'date': items[10], # Convert from MM/DD/YYY to YYYY-MM-DD
            'date': datetime.datetime.strptime(items[10], "%m/%d/%Y").strftime("%Y-%m-%d")
        }]

        #logger.info(result)
        #logger.info("\n")

        return result


class UserOptions(PipelineOptions):
    @classmethod
    def _add_argparse_args(cls, parser):
        # Use add_value_provider_argument for arguments to be templatable
        # Use add_argument as usual for non-templatable arguments
        #parser.add_value_provider_argument('--input',
        parser.add_value_provider_argument('--input',
                            dest='input',
                            default='gs://fabio-architecture-1/apple-health/member_fitness_tracker_history.csv',
                            help='Input file to process.')
        # Cannot make this templatable as the BigQuerySink does not support it
        parser.add_argument('--output',
                            dest='output',
                            type=str,
                            default='fitness_data.apple_health',
                            help='Output file to write results to.')

def run(argv=None):
    """The main function which creates the pipeline and runs it."""
    pipeline_options = PipelineOptions()
    user_options = pipeline_options.view_as(UserOptions)

    p = beam.Pipeline(options=pipeline_options)
    # Setup:
    # 0. Add value provider arguments to pipeline
    # 1. Create template_metadata file

    # 0. Convert XML into CSV/objects
    # 1. Parse out rows from CSV/objects
    # 2. Take out userId, hours of sleep, calories consumed, calories burned, and date
    # 3. Create 3 and/or 1 BigQuery table for those things only
    # 4. Write to BigQuery
    #logger.info("table: %s" % user_options.output.get())
    (p |
        # Read the file.  This is the source of the pipeline.  All further
        # processing starts with lines read from the file.  We use the input
        # argument from the command line.  We also skip the first line which is a
        # header row.
        'Read From Bucket' >> ReadFromText(user_options.input,
                                            skip_header_lines=1) |
        # This stage of the pipeline translates from a CSV file single row
        # input as a string, to a dictionary object consumable by BigQuery.
        # It refers to a function we have written.  This function will
        # be run in parallel on different workers using input from the
        # previous stage of the pipeline.
        'Line to BigQuery Row' >> beam.ParDo(LineToBigQueryRow()) |
        'Write to BigQuery' >> beam.io.Write(
            beam.io.BigQuerySink(
                user_options.output,
                schema='memberId:INTEGER, hoursSleep:INTEGER, caloriesConsumed:INTEGER, caloriesBurned:INTEGER, date:DATE',
                create_disposition=beam.io.BigQueryDisposition.CREATE_IF_NEEDED,
                write_disposition=beam.io.BigQueryDisposition.WRITE_APPEND)))

    result = p.run().wait_until_finish()
    logging.info('GCS to BigQuery result: %s', result)

if __name__ == '__main__':
    run()
