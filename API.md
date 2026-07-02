# API
employment api's

List Employments
This endpoint allows a developer to list the employments for this user. A National Insurance number and Tax year must be provided.
https://test-api.service.hmrc.gov.uk/individuals/employments-income/{nino}/{taxYear}
OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorizations:
User-Restricted (read:self-assessment)
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: read:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access

path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

taxYear
required
string
Example: 2021-22
The tax year the data applies to, for example, 2021-22. The start year and end year must not span two tax years. The minimum tax year is 2021-22. No gaps are allowed, for example, 2020-22 is not valid. (The minimum tax year in Sandbox is 2019-20.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the read:self-assessment scope.

Gov-Test-Scenario	
string
Only in sandbox environment. See Test Data table for all header values.
example response:
{
  "employments": [
    {
      "employmentId": "1557ecb5-fd32-48cc-81f5-e6acd1099f1c",
      "employerName": "Employer Name Ltd.",
      "dateIgnored": "2020-06-17T10:53:38.000Z"
    }
  ],
  "customEmployments": [
    {
      "employmentId": "2557ecb5-fd32-48cc-81f5-e6acd1099f2c",
      "employerName": "Employer Name Ltd."
    }
  ]
}


Retrieve an Employment
This endpoint allows the developer to retrieve details of an employment for this user. A National Insurance number, Tax year and Employment ID are required.

https://test-api.service.hmrc.gov.uk/individuals/employments-income/{nino}/{taxYear}/{employmentId}

Authorizations:
User-Restricted (read:self-assessment)
 OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: read:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

taxYear
required
string
Example: 2021-22
The tax year the data applies to, for example, 2021-22. The start year and end year must not span two tax years. The minimum tax year is 2021-22. No gaps are allowed, for example, 2020-22 is not valid. (The minimum tax year in Sandbox is 2019-20.)

employmentId
required
string^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89...Show pattern
Example: 4557ecb5-fd32-48cc-81f5-e6acd1099f3c
The unique identifier for the employment.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the read:self-assessment scope.

Gov-Test-Scenario	
string
Only in sandbox environment. See Test Data table for all header values.

example response
{
  "employerRef": "123/AZ12334",
  "employerName": "Employer Name Ltd.",
  "startDate": "2020-06-17",
  "cessationDate": "2020-06-17",
  "payrollId": "YDIAHPcYFQbOXLCKQ",
  "occupationalPension": false,
  "dateIgnored": "2020-06-17T10:53:38.000Z"
}

-----------------------------------------------------

What to do:

Call the endpoint automatically when the user views their employment section
Check the response — if all fields are empty, show nothing
Only display sections that have actual data

So the user experience is:

Most taxi drivers — they never see this section at all because the response is empty
A taxi driver who was made redundant from a PAYE job that year — they see a lump sum/redundancy section appear automatically
A taxi driver with a disability deduction — they see that section appear automatically

You don't need to:

Build a form for users to enter this data — it comes from HMRC
Show share options screens — just hide them if empty
Explain what it is unless data actually exists

Simple rule for your build:
Call endpoint
│
├── Response has data → display relevant sections
└── Response is empty → show nothing, move on
This way you cover all your users without cluttering the UI for the majority who won't have any of this. One API call, conditionally rendered UI. Claude Code can build this easily.


Retrieve Other Employment Income
This endpoint enables you to retrieve other employment income: share options, shares awarded or received, disability, lump sums and foreign service income. A National Insurance number and tax year must be provided.
https://test-api.service.hmrc.gov.uk/individuals/employments-income/other/{nino}/{taxYear}

Authorizations:
User-Restricted (read:self-assessment)
 OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: read:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

taxYear
required
string
Example: 2021-22
The tax year the data applies to, for example, 2021-22. The start year and end year must not span two tax years. The minimum tax year is 2021-22. No gaps are allowed, for example, 2020-22 is not valid. (The minimum tax year in Sandbox is 2019-20.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the read:self-assessment scope.

Gov-Test-Scenario	
string
Only in sandbox environment. See Test Data table for all header values.

-----------------------------------------------------

Retrieve an Employment and its Financial Details
This endpoint enables you to retrieve employment information and associated financial data for a given tax year. A National Insurance number, tax year and Employment ID must be provided.
https://test-api.service.hmrc.gov.uk/individuals/employments-income/{nino}/{taxYear}/{employmentId}/financial-details

Authorizations:
User-Restricted (read:self-assessment)
 OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: read:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

taxYear
required
string
Example: 2021-22
The tax year the data applies to, for example, 2021-22. The start year and end year must not span two tax years. The minimum tax year is 2021-22. No gaps are allowed, for example, 2020-22 is not valid. (The minimum tax year in Sandbox is 2019-20.)

employmentId
required
string^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89...Show pattern
Example: 4557ecb5-fd32-48cc-81f5-e6acd1099f3c
The unique identifier for the employment.

query Parameters
source	
string
Enum: "user" "hmrc-held" "latest"
Example: source=latest
Specifies the source of data to be returned. If source is not provided, the latest submitted values will be returned.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the read:self-assessment scope.

Gov-Test-Scenario	
string
Only in sandbox environment. See Test Data table for all header values.

--------------------------------------------------------

hmrc assist setup
Produce an HMRC Self Assessment assist report
The report contains targeted feedback based on what the customer advises HMRC in their update for the given National Insurance number (NINO), calculation ID, and tax year.

An HTTP 200 success code is returned and the targeted message, recommended action and guidance links are within the JSON for the software to display.

Software must allow sufficient time for the tax calculation to be generated before requesting an Assist report, as requesting the Assist report prior to the tax calculation being generated will return an HTTP 404 error code.

Software calls the Produce a HMRC Self Assessment Assist Report endpoint using the nino, calcId and relevant tax year.
HMRC receives the request.
If HMRC does not have any messages for the calculation, software receives HTTP 204 (success with no messages) response.
Customer views confirmation that there are no messages for that calculation.
If HMRC does have messages for the calculation, software receives HTTP 200 response with the relevant report, reportId and correlationId and presents the messages to the customer in full.
Customer views the message.
Software calls the Acknowledge a HMRC Self Assessment Assist Report endpoint using the reportId, correlationId and nino.
HMRC receives the acknowledgement and returns a HTTP 204 response.
Software receives the HTTP 204 response.

Produce a HMRC Self Assessment Assist Report
This endpoint allows a developer to request a HMRC Assist report to be generated for a customer or their agent.

post
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/assist/reports/{nino}/{taxYear}/{calculationId}

A 200 OK response is returned when applicable messages are available, and a 204 No Content response is returned when there are no messages to report.

userRestricted (read:self-assessment-assist)
OAuth2: userRestricted
HMRC supports OAuth 2.0 for authenticating user-restricted API requests using an OAuth 2.0 Bearer Token in the AUTHORIZATION header. See https://developer.service.hmrc.gov.uk/api-documentation/docs/authorisation/user-restricted-endpoints for details.

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: read:self-assessment-assist
Scopes:
write:self-assessment-assist - Grant write access
read:self-assessment-assist - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

taxYear
required
string
Example: 2025-26
The tax year the data applies to, for example, 2025-26. The start year and end year must not span two tax years. No gaps are allowed, for example, 2025-27 is not valid.

calculationId
required
string^[0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-...Show pattern
Example: f2fb30e5-4ab6-4a29-b3c1-c7264259ff1c
The unique identifier for the calculation. Must conform to the regular expression: ^[0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.1.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the read:self-assessment-assist scope.

example response
{
  "reportId": "579800fe-e047-cd40-b3e4-0e14b1f183a8",
  "messages": [
    {
      "title": "HMRC feedback: the title tells the user to review or check something in the return (placeholder title)",
      "body": "The body section is usually one to three sentences. This section lets the user know why they are getting the message or which tax rule is relevant. For example, if you use something for both business and personal reasons you can only claim allowable expenses for the business costs. (placeholder body)",
      "action": "The action section is usually three to four sentences. It explains what the user can do to resolve the potential error. In some messages this section may also warn users about consequences if they submit incorrect information. For example, the user may be advised to make changes if needed to avoid interest and potential penalties. (placeholder action)",
      "links": [
        {
          "title": "Go to GOV.UK to learn more about income tax. (placeholder link example 1)",
          "url": "https://www.gov.uk/income-tax"
        },
        {
          "title": "You can also go to GOVUK to find out about expenses when you’re self-employed. (placeholder link example 2)",
          "url": "https://www.gov.uk/expenses-if-youre-self-employed"
        },
        {
          "title": "Usually no more than three links per message and the whole sentence should be used as the link text. (placeholder link guidance)",
          "url": "https://www.gov.uk/tax-help"
        }
      ],
      "path": "/individuals/business/self-employment/[nino]/[businessId]/cumulative/[taxYear] (placeholder path)"
    }
  ],
  "nino": "TC663795B",
  "taxYear": "2025-26",
  "calculationId": "f2fb30e5-4ab6-4a29-b3c1-c7264259ff1c",
  "correlationId": "BD5A1B594995A197D528ECCF4BC6EA793C869B2F75333902F043E35561B927C4"
}

then use this endpoint 

Acknowledge a HMRC Self Assessment Assist Report
This endpoint allows a developer to acknowledge that the given report has been displayed in full to the customer or agent.

post
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/assist/reports/acknowledge/{nino}/{reportId}/{correlationId}

userRestricted (write:self-assessment-assist)
 OAuth2: userRestricted
HMRC supports OAuth 2.0 for authenticating user-restricted API requests using an OAuth 2.0 Bearer Token in the AUTHORIZATION header. See https://developer.service.hmrc.gov.uk/api-documentation/docs/authorisation/user-restricted-endpoints for details.

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: write:self-assessment-assist
Scopes:
write:self-assessment-assist - Grant write access
read:self-assessment-assist - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

reportId
required
string^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F...Show pattern
Example: 579800fe-e047-cd40-b3e4-0e14b1f183a8
The unique identifier for the report. Must conform to the regular expression: ^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$

correlationId
required
string
Example: BD5A1B594995A197D528ECCF4BC6EA793C869B2F75333902F043E35561B927C4
The correlation ID of the report.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.1.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the write:self-assessment-assist scope.

204 Success (No Content)
Response Headers
X-CorrelationId
required
string
Example: c75f40a6-a3df-4429-a697-471eeec46435
Unique ID for operation tracking String, 36 characters.

Key rule

Only call acknowledgement when:

report is actually rendered to the user
not just fetched in background
ideally confirmed by user action (best practice)

----------------------------------------------------------

Retrieve Business Details

This endpoint allows a developer to retrieve additional information for one of a user's business income source. The unique account reference (National Insurance number) must be provided as well as the unique business identifier.

Get
https://test-api.service.hmrc.gov.uk/individuals/business/details/{nino}/{businessId}

User-Restricted (read:self-assessment)
 OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: read:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
A unique identifier for the business income source. It must conform to the following regex: ^X[A-Z0-9]{1}IS[0-9]{11}$

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the read:self-assessment scope.

Gov-Test-Scenario	
string
Example: -
Only in sandbox environment. See Test Data table for all header values.

example response 200:
{
  "businessId": "XAIS12345678910",
  "typeOfBusiness": "self-employment",
  "tradingName": "ABC Ltd.",
  "yearOfMigration": "2022",
  "firstAccountingPeriodStartDate": "2019-09-30",
  "firstAccountingPeriodEndDate": "2020-02-29",
  "latencyDetails": {
    "latencyEndDate": "2020-02-27",
    "taxYear1": "2018-19",
    "latencyIndicator1": "A",
    "taxYear2": "2019-20",
    "latencyIndicator2": "A"
  },
  "accountingPeriods": [
    {
      "start": "2023-04-06",
      "end": "2024-04-05"
    }
  ],
  "quarterlyTypeChoice": {
    "quarterlyPeriodType": "standard",
    "taxYearOfChoice": "2023-24"
  },
  "commencementDate": "2023-04-06",
  "cessationDate": "2024-04-05",
  "businessAddressLineOne": "1 Acme Rd.",
  "businessAddressLineTwo": "London",
  "businessAddressLineThree": "Greater London",
  "businessAddressLineFour": "United Kingdom",
  "businessAddressPostcode": "M1 1AG",
  "businessAddressCountryCode": "GB"
}

------------------------------------------------------
Create and Amend Quarterly Period Type for a Business
This endpoint enables you to create and amend the type of quarterly reporting period used for a business for a specific tax year. You can choose standard quarterly periods (where the first period is 6 April to 5 July) or calendar quarterly periods (first period 1 April to 30 June) for each tax year. Note that the quarterly period type cannot be changed after a submission is made for that year.

Warning: If an invalid tax year or invalid business ID is submitted, the service will return a RULE_REQUEST_CANNOT_BE_FULFILLED error response. Only the current tax year is allowed and business IDs must relate to a self-employment or property income source.

HMRC gives customers a choice of two quarterly period types:

Standard — starts 6 April
Calendar — starts 1 April

Your app needs to let the user choose one at the start of each tax year and submit it via this endpoint before their first quarterly update. Once they submit their first update, it's locked for that year.
The simplest approach is to ask the user once during onboarding which they prefer and store their choice.

put
https://test-api.service.hmrc.gov.uk/individuals/business/details/{nino}/{businessId}/{taxYear}

Authorizations:
User-Restricted (write:self-assessment)
 OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: write:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
A unique identifier for the business income source. It must conform to the following regex: ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string^2[0-9]{3}-[0-9]{2}$
Example: 2023-24
The tax year for which a quarterly period type is being set.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the read:self-assessment scope.

Gov-Test-Scenario	
string
Example: -
Only in sandbox environment. See Test Data table for all header values.

Request Body schema: application/json
quarterlyPeriodType
required
string
Enum: "standard" "calendar"
The quarterly period type that is being set for the business id.

Responses
204 Success(No Content)
Response Headers
X-CorrelationId
required
string
Example: c75f40a6-a3df-4429-a697-471eeec46435
Unique ID for operation tracking String, 36 characters.

example response 400
Content type
application/json
Example

FORMAT_NINO
FORMAT_NINO
The format of the supplied NINO field is not valid.


Copy
{
"code": "FORMAT_NINO",
"message": "The provided NINO is invalid"
}

-----------------------------------------------------

Accounting Type
Retrieve Accounting Type
This endpoint allows a customer to retrieve the Accounting Type that they have on record. A National Insurance number, business ID and tax year must be provided.

Get
https://test-api.service.hmrc.gov.uk/individuals/business/details/{nino}/{businessId}/{taxYear}/accounting-type

Authorizations:
User-Restricted (read:self-assessment)
 OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: read:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
A unique identifier for the business income source. It must conform to the following regex: ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string^2[0-9]{3}-[0-9]{2}$
Example: 2024-25
The tax year the data applies to. The start year and end year must not span two tax years. No gaps are allowed, for example, 2025-27 is not valid.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the read:self-assessment scope.

Gov-Test-Scenario	
string
Example: -
Only in sandbox environment. See Test Data table for all header values.

example response 200
{
  "accountingType": "ACCRUAL"
}
example -> const type = await getAccountingType(nino, businessId, taxYear);
const profit =
  type === "CASH"
    ? calculateCash(transactions)
    : calculateAccrual(transactions);

---------------------------------------------------------
Update Accounting Type
This endpoint allows a customer to update the Accounting Type that they have on record. This can be done after the tax year has ended, before their Final Declaration. A National Insurance number, business ID and tax year must be provided.

After quarterly updates are done but before final declaration:
Quarterly updates complete
│
└── Submit Periods of Account dates
    (Create or Update Periods of Account endpoint)
    │
    └── Final declaration
Add a simple screen asking the user to confirm or enter their accounting period dates before they can proceed to final declaration.

Put
https://test-api.service.hmrc.gov.uk/individuals/business/details/{nino}/{businessId}/{taxYear}/accounting-type

Authorizations:
User-Restricted (write:self-assessment)
 OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: write:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
A unique identifier for the business income source. It must conform to the following regex: ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string^2[0-9]{3}-[0-9]{2}$
Example: 2025-26
The tax year the data applies to. The start year and end year must not span two tax years. The minimum tax year is 2025-26. No gaps are allowed, for example, 2025-27 is not valid. (The minimum tax year in Sandbox is 2024-25.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Content-Type
required
string
Value: "application/json"
Specifies the format of the request body, which must be JSON.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the write:self-assessment scope.

Gov-Test-Scenario	
string
Example: -
Only in sandbox environment. See Test Data table for all header values.

Request Body schema: application/json
accountingType
required
string
Enum: "CASH" "ACCRUAL"
The accounting type used.

CASH for cash basis (money actually received and paid out to calculate income and expenses).

ACCRUAL records revenues and expenses when they are incurred, regardless of when cash is exchanged.

give user choice of ACCRUAL OR CASH
Must be exactly "CASH" or "ACCRUAL" (case-sensitive string)
payload example
{
  "accountingType": "ACCRUAL"
}

--------------------------------------------------------
Retrieve Periods of Account
This API is used to retrieve a customers Periods of Account and Periods of Account dates. A National Insurance number, business ID and tax year must be provided.

GET
https://test-api.service.hmrc.gov.uk/individuals/business/details/{nino}/{businessId}/{taxYear}/periods-of-account

Authorizations:
User-Restricted (read:self-assessment)
 OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: read:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
A unique identifier for the self-employment business. Property business IDs will return a 404. It must conform to the following regex: ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string^2[0-9]{3}-[0-9]{2}$
Example: 2025-26
The tax year the data applies to. The start year and end year must not span two tax years. The minimum tax year is 2025-26. No gaps are allowed, for example, 2025-27 is not valid. (The minimum tax year in Sandbox is 2024-25.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the read:self-assessment scope.

Gov-Test-Scenario	
string
Example: -
Only in sandbox environment. See Test Data table for all header values.

example response
{
  "submittedOn": "2026-04-05T14:15:22.802Z",
  "periodsOfAccount": true,
  "periodsOfAccountDates": [
    {
      "startDate": "2025-04-06",
      "endDate": "2026-04-05"
    }
  ]
}

Response Schema: application/json
submittedOn
required
string <date-time>
The date and time of the submission. Must conform to the format YYYY-MM-DDThh:mm:ss.SSSZ

periodsOfAccount
required
boolean
Indicates whether the customer has periods of account.

If this value is true, then periodsOfAccountDates will be returned.

periodsOfAccountDates	
Array of objects
List of periods of account. These will be returned if a customer has submitted periods of account.

If periodsOfAccount is set to false, then this field will not be returned.

this is the Retrieve endpoint, not the Create/Update one. Use it to display existing periods of account to the user so they can review before final declaration.

-------------------------------------------------------------------

Create or Update Periods of Account
This API is used to declare whether a customer has Periods of Account and can submit the Periods of Account dates. This has to be submitted before final declaration. A National Insurance number, business ID and tax year must be provided.

PUT
Create or Update Periods of Account
This API is used to declare whether a customer has Periods of Account and can submit the Periods of Account dates. This has to be submitted before final declaration. A National Insurance number, business ID and tax year must be provided.

Payload
{
  "periodsOfAccount": true,
  "periodsOfAccountDates": [
    {
      "startDate": "2025-04-06",
      "endDate": "2026-04-05"
    }
  ]
}

Authorizations:
User-Restricted (write:self-assessment)
 OAuth2: User-Restricted
HMRC supports OAuth 2.0 for authenticating User-restricted API requests

Flow type: authorizationCode
Authorization URL: https://api.service.hmrc.gov.uk/oauth/authorize
Token URL: https://api.service.hmrc.gov.uk/oauth/token
Refresh URL: https://api.service.hmrc.gov.uk/oauth/refresh
Required scopes: write:self-assessment
Scopes:
write:self-assessment - Grant write access
read:self-assessment - Grant read access
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
A unique identifier for the self-employment business. Property business IDs will return a 404. It must conform to the following regex: ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string^2[0-9]{3}-[0-9]{2}$
Example: 2025-26
The tax year the data applies to. The start year and end year must not span two tax years. The minimum tax year is 2025-26. No gaps are allowed, for example, 2025-27 is not valid. (The minimum tax year in Sandbox is 2024-25.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.2.0+json"
Specifies the response format and the version of the API to be used.

Content-Type
required
string
Value: "application/json"
Specifies the format of the request body, which must be JSON.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the write:self-assessment scope.

Gov-Test-Scenario	
string
Example: -
Only in sandbox environment. See Test Data table for all header values.

Request Body schema: application/json
periodsOfAccount
required
boolean
Indicates whether the customer has periods of account.

If this value is true, then periodsOfAccountDates must be submitted.

periodsOfAccountDates	
Array of objects
List of periods of account. These must be submitted if a customer has periods of account.

If periodsOfAccount is set to false, then this field should not be submitted.

response example 400
The format of the supplied NINO field is not valid.


Copy
{
"code": "FORMAT_NINO",
"message": "The provided NINO is invalid"
}

---------------------------------------------------------------