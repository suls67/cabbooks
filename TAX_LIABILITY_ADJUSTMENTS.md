Individuals Tax Liability Adjustments (MTD) API

HMRC monitors transactions to help protect your customers' confidential data from criminals and fraudsters.

! Warning You are required by law to submit header data for this API. This includes all associated APIs and endpoints.


Retrieve Tax Liability Adjustments
This endpoint allows a developer to retrieve tax liability adjustments for a specified individual for a given tax year. A National Insurance number and tax year are required.

GET
https://test-api.service.hmrc.gov.uk/individuals/tax-liability/adjustments/{nino}/{taxYear}

response sample 200
{
  "submittedOn": "2026-08-24T14:15:22.544Z",
  "carryBackLossesDecrease": {
    "incomeTax": 5000.99,
    "class4": 5000.99,
    "capitalGainsTax": 5000.99
  }
}

Test data
Scenario simulation using Gov-Test-Scenario headers is only available in the sandbox environment.

Header Value (Gov-Test-Scenario)	Scenario
N/A - DEFAULT	Simulates success response.
NOT_FOUND	Simulates the scenario where no data is found.
STATEFUL	Performs a stateful retrieve.

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
Example: 2026-27
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2026-27. No gaps are allowed, for example, 2026-28 is not valid.

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
An OAuth 2.0 Bearer Token with the read:self-assessment scope.

Gov-Test-Scenario	
string
Only in sandbox environment. See Test Data table for all header values.

-----------------------------------------------------------------

Create or Amend Tax Liability Adjustments
This endpoint allows a developer to create or amend tax liability adjustments for a specified individual for a given tax year. A National Insurance number and tax year are required.

Note: When submitting adjustments for carry-back losses, the corresponding carry-back losses must also be submitted using the Create or Amend Losses and Claims endpoint in the Individual Losses API before the final declaration.

PUT
https://test-api.service.hmrc.gov.uk/individuals/tax-liability/adjustments/{nino}/{taxYear}

PAYLOAD
{
  "carryBackLossesDecrease": {
    "incomeTax": 5000.99,
    "class4": 5000.99,
    "capitalGainsTax": 5000.99
  }
}

Test data
Scenario simulation using Gov-Test-Scenario headers is only available in the sandbox environment.

Header Value (Gov-Test-Scenario)	Scenario
N/A - DEFAULT	Simulates success response.
OUTSIDE_AMENDMENT_WINDOW	Simulates the scenario where request cannot be completed as it is outside the amendment window.
STATEFUL	Performs a stateful create or update.

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

taxYear
required
string
Example: 2026-27
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2026-27. No gaps are allowed, for example, 2026-28 is not valid.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.1.0+json"
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
Only in sandbox environment. See Test Data table for all header values.

suspend-temporal-validations	
boolean
Example: true
Only in the sandbox environment. When supplied and set to true, this header relaxes tax year validation rule to allow in-year submissions for endpoints configured for end-of-year submissions. Not supplying the header or setting it to false results in a RULE_TAX_YEAR_NOT_ENDED error for in-year submissions. In Production, the header is ignored and normal validations apply.

Request Body schema: application/json
carryBackLossesDecrease	
object
Object containing adjustments that decrease the current tax year's total liability based on carry-back of current year losses.

---------------------------------------------------------------

Delete Tax Liability Adjustments
This endpoint allows a developer to delete tax liability adjustments for a specified individual for a given tax year. A National Insurance number and tax year are required.

DELETE
https://test-api.service.hmrc.gov.uk/individuals/tax-liability/adjustments/{nino}/{taxYear}



Test data
Scenario simulation using Gov-Test-Scenario headers is only available in the sandbox environment.

Header Value (Gov-Test-Scenario)	Scenario
N/A - DEFAULT	Simulates success response.
NOT_FOUND	Simulates the scenario where no data is found.
OUTSIDE_AMENDMENT_WINDOW	Simulates the scenario where request cannot be completed as it is outside the amendment window.
STATEFUL	Performs a stateful delete.

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

taxYear
required
string
Example: 2026-27
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2026-27. No gaps are allowed, for example, 2026-28 is not valid.

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
An OAuth 2.0 Bearer Token with the write:self-assessment scope.

Gov-Test-Scenario	
string
Only in sandbox environment. See Test Data table for all header values.

