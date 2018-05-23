# hubOnboard
Node script to onboard asset metadata to the Copyright Hub

This is a simple Node.js script that allows asset metadata to be added ("onboarded") to a Copyright Hub repository.

The [Copyright Hub](http://www.copyrighthub.org) aims to  help copyright work the way the internet works by making the process of giving and getting permission – the basic building block of the copyright process – fit for purpose in the age of the Internet.

## Requirements

### Script and dependencies
Clone the repo and install dependencies with
```
git clone git@github.com:danmermel/hubOnboard.git
cd hubOnboard
npm install
```


### Credentials 
You need to have credentials for onboarding to the Copyright Hub. [Get in touch with them](http://www.copyrighthub.org/contact) and ask them.
Once you have those, create a configProd.json and a configStage.json files with the credentials for production and staging, e.g:

```
{
"clientID" : "344444467a59f6113957ed42a46",
"clientSecret" : "RdvTIMfDk42zd33PvoUReWJcy5rLl0",
"repo" : "4410e8fb90d2a8d32d9c55e2a4834a4b"
}
```

## Usage
You need to supply a tab-separated csv file with fields for:
* source_id_type (at least one is mandatory. More than 1 separated by ~)
* source_id (at least one is mandatory. More than 1 separated by ~)
* offer_id (optional. More than one separated by ~)
* description (optional)

Example row with multiple ids and a single offer:

```
plsid~isn	2844132~9781784717506	2d9c55e2a44410e8fb9d3834a4b0d2a8	Principles of Law and Economics Third Edition
```

You can then call the script from the command line thus:

```
node auth.js env=prod source=myfile.csv results=myresults.txt
```
where 
* **env** is one of prod | stage  (if not supplied, it will assume it is stage)
* **source** is the csv file in the format specified above.
* **results** is the file where the script results will be written. For every successful row onboarded from the csv file it will write a line into the results file that looks like this:

```
plsid~isn	2844127~9781781956021		Principles of Law and Economics Third Edition	 https://openpermissions.org/s1/hub1/2231b4a032c743e99471d349182a194b/asset/042c49b4302d4b3ab47c5006ba4d1929
```
The last column is the item's "hubkey". This is a URI and its contents can be inspected by doing:

```
https://query-stage.copyrighthub.org/v1/query/entities?hub_key=https://openpermissions.org/s1/hub1/0d03c70712a8483ebf6d4a7c17228f9e/asset/628536b03fbb4fbe9aad1eb1bf9a88b4
```
on staging and 

```
https://query.copyrighthub.org/v1/query/entities?hub_key=https://openpermissions.org/s1/hub1/0d03c70712a8483ebf6d4a7c17228f9e/asset/628536b03fbb4fbe9aad1eb1bf9a88b4
```
on production.
