Individual Losses (MTD) API

Retrieve Losses and Claims
This endpoint allows a developer to retrieve a claim or a brought-forward-loss for a specified individual and business for a given tax year. A National Insurance number, business ID and tax year are required.

GET
https://test-api.service.hmrc.gov.uk/individuals/losses/{nino}/businesses/{businessId}/loss-claims/{taxYear}

reponse example 200
{
  "submittedOn": "2026-08-24T14:15:22.544Z",
  "claims": {
    "carryBack": {
      "previousYearGeneralIncome": 5000.99,
      "earlyYearLosses": 5000.99
    },
    "carrySideways": {
      "currentYearGeneralIncome": 5000.99
    },
    "preferenceOrder": {
      "applyFirst": "carry-sideways"
    },
    "carryForward": {
      "currentYearLosses": 5000.99,
      "previousYearsLosses": 5000.99
    }
  },
  "losses": {
    "broughtForwardLosses": 5000.99
  }
}

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
National Insurance number, in the format AA999999A.

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
An identifier for the business, unique to the customer.

taxYear
required
string
Example: 2026-27
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2026-27. No gaps are allowed, for example, 2026-28 is not valid.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.7.0+json"
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

-------------------------------------------------------------
Create or Amend Losses and Claims
This endpoint allows a developer to submit or amend a claim or a brought-forward-loss for a specified individual and business for a given tax year. A National Insurance number, business ID and tax year are required.

PUT
https://test-api.service.hmrc.gov.uk/individuals/losses/{nino}/businesses/{businessId}/loss-claims/{taxYear}

PAYLOAD
{
  "claims": {
    "carryBack": {
      "previousYearGeneralIncome": 5000.99,
      "earlyYearLosses": 5000.99
    },
    "carrySideways": {
      "currentYearGeneralIncome": 5000.99
    },
    "preferenceOrder": {
      "applyFirst": "carry-sideways"
    },
    "carryForward": {
      "currentYearLosses": 5000.99,
      "previousYearsLosses": 5000.99
    }
  },
  "losses": {
    "broughtForwardLosses": 5000.99
  }
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
National Insurance number, in the format AA999999A.

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
An identifier for the business, unique to the customer.

taxYear
required
string
Example: 2026-27
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2026-27. No gaps are allowed, for example, 2026-28 is not valid.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.7.0+json"
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

suspend-temporal-validations	
boolean
Example: true
Only in the sandbox environment. When supplied and set to true, this header relaxes tax year validation rule to allow in-year submissions for endpoints configured for end-of-year submissions. Not supplying the header or setting it to false results in a RULE_TAX_YEAR_NOT_ENDED error for in-year submissions. In Production, the header is ignored and normal validations apply.

Request Body schema: application/json
claims	
object
Object containing claim details.

losses	
object
Object containing brought forward loss amount.

-----------------------------------------------------------
Delete Losses and Claims
This endpoint allows a developer to delete a claim or a brought-forward-loss for a specified individual and business for a given tax year. A National Insurance number, business ID and tax year are required.

DELETE
https://test-api.service.hmrc.gov.uk/individuals/losses/{nino}/businesses/{businessId}/loss-claims/{taxYear}

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
National Insurance number, in the format AA999999A.

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
An identifier for the business, unique to the customer.

taxYear
required
string
Example: 2026-27
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2026-27. No gaps are allowed, for example, 2026-28 is not valid.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.7.0+json"
Specifies the response format and the version of the API to be used.

Authorization
required
string
Example: Bearer bb7fed3fe10dd235a2ccda3d50fb
An OAuth 2.0 Bearer Token with the write:self-assessment scope.

Gov-Test-Scenario	
string
Example: -
Only in sandbox environment. See Test Data table for all header values.

-------------------------------------------------------------
to be checked or corrected

A good solution is to make the warning automatic without blocking the user.

For example:

User enters a carry-back adjustment in the Carry Back Losses screen.
When they save, check whether a matching loss exists in the Individual Losses records.
If none exists, show a non-blocking warning such as:

"This carry-back adjustment should also be reported in Individual Losses before the Final Declaration is submitted."

Add a button:
Go to Individual Losses
Before allowing the Final Declaration to be submitted, perform the same check again. If any carry-back adjustments are missing corresponding Individual Losses, display a stronger warning listing the affected tax years. The user can then either:
Go to Individual Losses, or
Confirm they want to continue (if you don't want to enforce it).

This keeps the workflow user-friendly while helping prevent HMRC submission errors. The final declaration step is the best place to perform the last validation because that's when the data must be complete.