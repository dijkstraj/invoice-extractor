# Invoice Extractor

Serverless stack to strip the first page from a PDF attachment in an email.
Useful when you need the first page of the invoice for your mobile phone subscription to claim back your phone costs
(without also sending in the complete history of calls you made and bytes you browsed).

## How-to

* Create a domain name in Route 53, for these instructions we'll assume it's `amazing.com`
* We'll also assume we're getting invoices from a company called "MyTelco"
* Create a config file by running `cp config.yml-example config.yml`
* Change the `incomingEmailAddress` to `mytelco@amazing.com`
* Think of some good bucket names
* Deploy the stack with `serverless deploy`
* Now we can forward the invoice emails to ourselves for processing:
    * Create a filter in your mail client based on the sender (something like `info@mytelco.com`),
      the subject (something like `Your monthly invoice`) and the fact that the email has an attachment
    * Let the filtered messages be forwarded to `mytelco@amazing.com`
* Let's say you get an invoice mailed to you in september you'll be able to find it at `s3://<targetBucket>/201909/201909-MyTelco-Factuur.pdf`

## Testing

There's a sample e-mail with a three-page PDF included in the repo.
Simply run the following command to trigger the extractor:

```bash
aws s3 cp ./sample.email s3://<sourceBucket>-dev/
```

You'll find a one-page PDF in you `targetBucket`.
