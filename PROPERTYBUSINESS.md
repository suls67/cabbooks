Property Business (MTD) (6.0)

Annual Submissions

Retrieve a UK Property Business Annual Submission

GET 
https://test-api.service.hmrc.gov.uk/individuals/business/property/uk/{nino}/{businessId}/annual/{taxYear}

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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
  "submittedOn": "2020-06-17T10:59:47.544Z",
  "ukFhlProperty": {
    "adjustments": {
      "balancingCharge": 231.45,
      "periodOfGraceAdjustment": true,
      "businessPremisesRenovationAllowanceBalancingCharges": 567.67,
      "nonResidentLandlord": true,
      "rentARoom": {
        "jointlyLet": true
      }
    },
    "allowances": {
      "propertyIncomeAllowance": 453.45
    }
  },
  "ukProperty": {
    "adjustments": {
      "balancingCharge": 565.34,
      "businessPremisesRenovationAllowanceBalancingCharges": 563.34,
      "nonResidentLandlord": true,
      "rentARoom": {
        "jointlyLet": true
      }
    },
    "allowances": {
      "propertyIncomeAllowance": 342.34
    }
  }
}

-------------------------------------
Create and Amend a UK Property Business Annual Submission

PUT
https://test-api.service.hmrc.gov.uk/individuals/business/property/uk/{nino}/{businessId}/annual/{taxYear}

PAYLOAD
{
  "ukFhlProperty": {
    "allowances": {
      "propertyIncomeAllowance": 123.45
    },
    "adjustments": {
      "balancingCharge": 231.45,
      "periodOfGraceAdjustment": true,
      "businessPremisesRenovationAllowanceBalancingCharges": 567.67,
      "nonResidentLandlord": true,
      "rentARoom": {
        "jointlyLet": true
      }
    }
  },
  "ukProperty": {
    "allowances": {
      "propertyIncomeAllowance": 678.45
    },
    "adjustments": {
      "balancingCharge": 565.34,
      "businessPremisesRenovationAllowanceBalancingCharges": 563.34,
      "nonResidentLandlord": true,
      "rentARoom": {
        "jointlyLet": true
      }
    }
  }
}

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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
One of For TY 2024-25 and beforeFor TY 2025-26 and after
ukFhlProperty	
object
Object holding the adjustments and allowances of the user's Furnished Holiday Letting (FHL) in the United Kingdom.

ukProperty	
object
Object holding allowances and adjustments for UK property business - excluding Furnished Holiday Lettings (FHL) for the period.

response example 400
{
  "code": "FORMAT_NINO",
  "message": "The provided NINO is invalid"
}

------------------------------------------------------------
Retrieve a Foreign Property Annual Submission
This endpoint enables you to retrieve adjustments and allowances for a foreign property business, for either or both of Furnished Holiday Letting (FHL) in the European Economic Area (EEA) and Non-FHL Foreign property submissions. A National Insurance number, business ID and tax year are required.

Note: For tax years before 2025-26, data can be submitted for either a Foreign FHL-EEA or Non-FHL property. From tax year 2025-26 onwards, the Foreign FHL-EEA and Non-FHL property types are no longer valid and you must use the Foreign property type.


GET
https://test-api.service.hmrc.gov.uk/individuals/business/property/foreign/{nino}/{businessId}/annual/{taxYear}

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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)

query Parameters
propertyId	
string <uuid>
Example: propertyId=8e8b8450-dc1b-4360-8109-7067337b42cb
A unique identifier for each foreign property. This parameter is only supported for tax years 2026-27 onwards.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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

response example 200
{
  "submittedOn": "2020-06-17T10:59:47.544Z",
  "foreignFhlEea": {
    "adjustments": {
      "privateUseAdjustment": 34343.45,
      "balancingCharge": 53543.23,
      "periodOfGraceAdjustment": true
    },
    "allowances": {
      "annualInvestmentAllowance": 3434.23,
      "otherCapitalAllowance": 1343.34,
      "electricChargePointAllowance": 6565.45,
      "zeroEmissionsCarAllowance": 3456.34
    }
  },
  "foreignProperty": [
    {
      "countryCode": "LBN",
      "adjustments": {
        "privateUseAdjustment": 4553.34,
        "balancingCharge": 3453.34
      },
      "allowances": {
        "annualInvestmentAllowance": 38330.95,
        "costOfReplacingDomesticItems": 41985.17,
        "zeroEmissionsGoodsVehicleAllowance": 9769.19,
        "otherCapitalAllowance": 1049.21,
        "electricChargePointAllowance": 3565.45,
        "structuredBuildingAllowance": [
          {
            "amount": 3545.12,
            "firstYear": {
              "qualifyingDate": "2020-03-29",
              "qualifyingAmountExpenditure": 3453.34
            },
            "building": {
              "name": "Blue Oaks",
              "number": "12",
              "postcode": "TF3 4GH"
            }
          }
        ],
        "zeroEmissionsCarAllowance": 3456.34
      }
    }
  ]
}

------------------------------------------
Create and Amend a Foreign Property Annual Submission
This endpoint enables you to re-submit adjustments and allowances for a foreign property business. This submission is for either or both of Furnished Holiday Letting (FHL) in the European Economic Area (EEA) and Non-FHL Foreign Property submissions. A National Insurance number, business ID and tax year must be provided.

Note: For tax years before 2025-26, data can be submitted for either a Foreign FHL-EEA or Non-FHL property. From tax year 2025-26 onwards, the Foreign FHL-EEA and Non-FHL property types are no longer valid and you must use the Foreign property type.

PUT
https://test-api.service.hmrc.gov.uk/individuals/business/property/foreign/{nino}/{businessId}/annual/{taxYear}

PAYLOAD
{
  "foreignFhlEea": {
    "adjustments": {
      "privateUseAdjustment": 34343.45,
      "balancingCharge": 53543.23,
      "periodOfGraceAdjustment": true
    },
    "allowances": {
      "annualInvestmentAllowance": 3434.23,
      "otherCapitalAllowance": 1343.34,
      "electricChargePointAllowance": 6565.45,
      "zeroEmissionsCarAllowance": 3456.34
    }
  },
  "foreignProperty": [
    {
      "countryCode": "LBN",
      "adjustments": {
        "privateUseAdjustment": 4553.34,
        "balancingCharge": 3453.34
      },
      "allowances": {
        "annualInvestmentAllowance": 38330.95,
        "costOfReplacingDomesticItems": 41985.17,
        "zeroEmissionsGoodsVehicleAllowance": 9769.19,
        "otherCapitalAllowance": 1049.21,
        "electricChargePointAllowance": 3565.45,
        "zeroEmissionsCarAllowance": 1000.99,
        "structuredBuildingAllowance": [
          {
            "amount": 3545.12,
            "firstYear": {
              "qualifyingDate": "2020-03-29",
              "qualifyingAmountExpenditure": 3453.34
            },
            "building": {
              "name": "Green Oaks",
              "number": "12",
              "postcode": "TF3 4GH"
            }
          }
        ]
      }
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
National Insurance number, in the format AA999999A.

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
An identifier for the business, unique to the customer.

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
One of For TY 2024-25 and beforeFor TY 2025-26For TY 2026-27 and after
foreignFhlEea	
object
Object holding the adjustments and allowances of the user's Furnished Holiday Lets in the European Economic Area for the period.

foreignProperty	
Array of objects
Array holding the adjustments and allowances of the user's foreign property business - excluding Furnished Holiday Lettings (FHL) in the European Economic Area (EEA) for the period.

response example 400
{
  "code": "FORMAT_NINO",
  "message": "The provided NINO is invalid"
}

---------------------------------------------------
Delete a Property Annual Submission
This endpoint allows the developer to delete the adjustments and allowances for a UK or Foreign property business in a tax year. A National Insurance number, business ID and tax year must be provided.

DELETE
https://test-api.service.hmrc.gov.uk/individuals/business/property/{nino}/{businessId}/annual/{taxYear}

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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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

---------------------------------------------------------------
---------------------------------------------------------------
Income and Expenses Period Summaries

Create a UK Property Income & Expenses Period Summary
This endpoint allows a developer to submit the income and expenses for a UK property business. This submission is for either or both of Furnished Holiday Letting (FHL) and Non FHL UK property submissions. A National Insurance number, business ID and tax year are required.

Note: This endpoint only supports submissions up to tax year 2024-25. New endpoints which support cumulative submission are provided for tax year 2025-26 onwards.

POST
https://test-api.service.hmrc.gov.uk/individuals/business/property/uk/{nino}/{businessId}/period/{taxYear}

PAYLOAD
{
  "fromDate": "2021-04-06",
  "toDate": "2021-07-05",
  "ukFhlProperty": {
    "income": {
      "periodAmount": 5000.99,
      "taxDeducted": 3123.21,
      "rentARoom": {
        "rentsReceived": 532.12
      }
    },
    "expenses": {
      "premisesRunningCosts": 3123.21,
      "repairsAndMaintenance": 928.42,
      "financialCosts": 842.99,
      "professionalFees": 8831.12,
      "costOfServices": 484.12,
      "other": 99282,
      "travelCosts": 974.47,
      "rentARoom": {
        "amountClaimed": 8842.43
      }
    }
  },
  "ukNonFhlProperty": {
    "income": {
      "premiumsOfLeaseGrant": 42.12,
      "reversePremiums": 84.31,
      "periodAmount": 9884.93,
      "taxDeducted": 842.99,
      "otherIncome": 31.44,
      "rentARoom": {
        "rentsReceived": 947.66
      }
    },
    "expenses": {
      "premisesRunningCosts": 4141.21,
      "repairsAndMaintenance": 582.21,
      "financialCosts": 829.39,
      "professionalFees": 4992.31,
      "costOfServices": 98.21,
      "other": 29.48,
      "residentialFinancialCost": 2884.99,
      "travelCosts": 48.93,
      "residentialFinancialCostsCarriedForward": 483.91,
      "rentARoom": {
        "amountClaimed": 88.21
      }
    }
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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
One of For TY 2023-24 and beforeFor TY 2024-25
fromDate
required
string <date>
The first day that the income and expenses period summary covers. Must conform to the format YYYY-MM-DD (Our systems only accept dates between 1900-01-01 and 2100-01-01)

toDate
required
string <date>
The last day that the income and expenses period summary covers. Must conform to the format YYYY-MM-DD (Our systems only accept dates between 1900-01-01 and 2100-01-01)

ukFhlProperty	
object
Object holding the income and expenses of the UK property business. (At least one of income or expenses should be present)

ukNonFhlProperty	
object
Object holding the income and expenses of the UK property business - excluding Furnished Holiday Lettings (FHL) for the period. (At least one of income or expenses should be present)

example response 201
{
  "submissionId": "4557ecb5-fd32-48cc-81f5-e6acd1099f3c"
}

----------------------------------------------------------

Retrieve a UK Property Income & Expenses Period Summary
This endpoint allows a developer to retrieve the income and expenses for a UK property business, that occurred between tax year. A National Insurance number, business ID, tax year and submission ID are required.

Note: This endpoint only supports submissions up to tax year 2024-25. New endpoints which support cumulative submission are provided for tax year 2025-26 onwards.

GET
https://test-api.service.hmrc.gov.uk/individuals/business/property/uk/{nino}/{businessId}/period/{taxYear}/{submissionId}

response example 200
{
  "submittedOn": "2024-10-21T10:59:47.544Z",
  "fromDate": "2022-04-06",
  "toDate": "2022-07-04",
  "ukFhlProperty": {
    "income": {
      "periodAmount": 5000.99,
      "taxDeducted": 5000.99,
      "rentARoom": {
        "rentsReceived": 5000.99
      }
    },
    "expenses": {
      "premisesRunningCosts": 5000.99,
      "repairsAndMaintenance": 5000.99,
      "financialCosts": 5000.99,
      "professionalFees": 5000.99,
      "costOfServices": 5000.99,
      "other": 5000.99,
      "travelCosts": 5000.99,
      "rentARoom": {
        "amountClaimed": 5000.99
      }
    }
  },
  "ukNonFhlProperty": {
    "income": {
      "premiumsOfLeaseGrant": 5000.99,
      "reversePremiums": 5000.99,
      "periodAmount": 5000.99,
      "taxDeducted": 5000.99,
      "otherIncome": 5000.99,
      "rentARoom": {
        "rentsReceived": 5000.99
      }
    },
    "expenses": {
      "premisesRunningCosts": 5000.99,
      "repairsAndMaintenance": 5000.99,
      "financialCosts": 5000.99,
      "professionalFees": 5000.99,
      "costOfServices": 5000.99,
      "other": 5000.99,
      "residentialFinancialCost": 5000.99,
      "travelCosts": 5000.99,
      "residentialFinancialCostsCarriedForward": 5000.99,
      "rentARoom": {
        "amountClaimed": 5000.99
      }
    }
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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)

submissionId
required
string^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][...Show pattern
Example: 4557ecb5-fd32-48cc-81f5-e6acd1099f3c
An identifier for the income and expenditure period summary.

Must conform to the regular expression ^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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

-----------------------------------------------------------
Amend a UK Property Income & Expenses Period Summary
This endpoint allows a developer to re-submit the income and expenditure for a UK property business. This submission is for either or both of Furnished Holiday Letting (FHL) and Non FHL UK property submissions. A National Insurance number, business ID, tax year and submission ID are required.

Note: This endpoint only supports submissions up to tax year 2024-25. New endpoints which support cumulative submission are provided for tax year 2025-26 onwards.

PUT
https://test-api.service.hmrc.gov.uk/individuals/business/property/uk/{nino}/{businessId}/period/{taxYear}/{submissionId}

PAYLOAD
{
  "ukFhlProperty": {
    "income": {
      "periodAmount": 5000.99,
      "taxDeducted": 3123.21,
      "rentARoom": {
        "rentsReceived": 532.12
      }
    },
    "expenses": {
      "premisesRunningCosts": 3123.21,
      "repairsAndMaintenance": 928.42,
      "financialCosts": 842.99,
      "professionalFees": 8831.12,
      "costOfServices": 484.12,
      "other": 99282,
      "travelCosts": 974.47,
      "rentARoom": {
        "amountClaimed": 8842.43
      }
    }
  },
  "ukNonFhlProperty": {
    "income": {
      "premiumsOfLeaseGrant": 42.12,
      "reversePremiums": 84.31,
      "periodAmount": 9884.93,
      "taxDeducted": 842.99,
      "otherIncome": 31.44,
      "rentARoom": {
        "rentsReceived": 947.66
      }
    },
    "expenses": {
      "premisesRunningCosts": 4141.21,
      "repairsAndMaintenance": 582.21,
      "financialCosts": 829.39,
      "professionalFees": 4992.31,
      "costOfServices": 98.21,
      "other": 29.48,
      "residentialFinancialCost": 2884.99,
      "travelCosts": 48.93,
      "residentialFinancialCostsCarriedForward": 483.91,
      "rentARoom": {
        "amountClaimed": 88.21
      }
    }
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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)

submissionId
required
string^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][...Show pattern
Example: 4557ecb5-fd32-48cc-81f5-e6acd1099f3c
An identifier for the income and expenditure period summary.

Must conform to the regular expression ^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
One of For TY 2023-24 and beforeFor TY 2024-25
ukFhlProperty	
object
Object holding the income and expenditure of the user's Furnished Holiday Letting (FHL) in the United Kingdom for the period. (At least one of income or expenses should be present)

ukNonFhlProperty	
object
Object holding the income and expenses of the UK property business - excluding Furnished Holiday Lettings (FHL) for the period. (At least one of income or expenses should be present)

response example 400
{
  "code": "FORMAT_NINO",
  "message": "The provided NINO is invalid"
}

--------------------------------------------------------

Retrieve a UK Property Cumulative Period Summary
This endpoint enables you to retrieve the cumulative period income and expenses for a UK property business. A National Insurance number, business ID, and tax year are required.

Please note that this endpoint is only available for tax years starting from 2025-26.

GET
https://test-api.service.hmrc.gov.uk/individuals/business/property/uk/{nino}/{businessId}/cumulative/{taxYear}

response example 200
{
  "submittedOn": "2025-07-07T10:59:47.544Z",
  "fromDate": "2025-04-06",
  "toDate": "2025-07-05",
  "ukProperty": {
    "income": {
      "premiumsOfLeaseGrant": 4889.23,
      "reversePremiums": 847.35,
      "periodAmount": 747.45,
      "taxDeducted": 984.29,
      "otherIncome": 954.32,
      "rentARoom": {
        "rentsReceived": 488.39
      }
    },
    "expenses": {
      "premisesRunningCosts": -4141.21,
      "repairsAndMaintenance": -582.25,
      "financialCosts": 829.39,
      "professionalFees": -4992.31,
      "costOfServices": -98.5,
      "other": 488.95,
      "residentialFinancialCost": 2884.99,
      "travelCosts": 48.93,
      "residentialFinancialCostsCarriedForward": 483.91,
      "rentARoom": {
        "amountClaimed": 88.55
      }
    }
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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2025-26
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2025-26. No gaps are allowed, for example, 2025-27 is not valid.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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

-----------------------------------------------------------
Create or Amend a UK Property Cumulative Period Summary
This endpoint enables you to submit the cumulative period income and expenses for a UK property business that occurred between two dates. A National Insurance number, tax year and business ID are required.

Please note that this endpoint is only available for tax years starting from 2025-26.

PUT
https://test-api.service.hmrc.gov.uk/individuals/business/property/uk/{nino}/{businessId}/cumulative/{taxYear}

PAYLOAD
{
  "fromDate": "2025-04-06",
  "toDate": "2025-07-05",
  "ukProperty": {
    "income": {
      "premiumsOfLeaseGrant": 4889.23,
      "reversePremiums": 847.35,
      "periodAmount": 5000.99,
      "taxDeducted": 3123.21,
      "otherIncome": 954.32,
      "rentARoom": {
        "rentsReceived": 532.12
      }
    },
    "expenses": {
      "premisesRunningCosts": 3123.21,
      "repairsAndMaintenance": 928.42,
      "financialCosts": -842.99,
      "professionalFees": -8831.12,
      "costOfServices": 484.12,
      "other": 99282,
      "residentialFinancialCost": 2884.99,
      "travelCosts": 974.47,
      "residentialFinancialCostsCarriedForward": 483.91,
      "rentARoom": {
        "amountClaimed": 8842.43
      }
    }
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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2025-26
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2025-26. No gaps are allowed, for example, 2025-27 is not valid.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
fromDate	
string <date>
The first day that the income and expenses period summary covers. Must conform to the format: YYYY-MM-DD.

For users with ITSA status of 'annual' or a latent income source, these dates are not required.

toDate	
string <date>
The last day that the income and expenses period summary covers. Must conform to the format: YYYY-MM-DD.

For users with ITSA status of 'annual' or a latent income source, these dates are not required.

ukProperty
required
object
Object holding the income and expenses of the UK property business.

---------------------------------------------------------------
Create a Foreign Property Income & Expenses Period Summary
This endpoint allows the developer to submit the income and expenses for a foreign property business that occurred between two dates. This submission is for either or both of Furnished Holiday Lettings (FHL) in the European Economic Area (EEA) and all other foreign Property submissions. In the case of Non-FHL Foreign Property, if there are multiple properties per country, the income and expenses should be the total across all properties. A National Insurance number, tax year and business ID are required.

Note: This endpoint only supports submissions up to tax year 2024-25. New endpoints which support cumulative submission are provided for tax year 2025-26 onwards.

POST
https://test-api.service.hmrc.gov.uk/individuals/business/property/foreign/{nino}/{businessId}/period/{taxYear}

PAYLOAD
{
  "fromDate": "2020-04-06",
  "toDate": "2020-07-05",
  "foreignFhlEea": {
    "income": {
      "rentAmount": 5000.99
    },
    "expenses": {
      "premisesRunningCosts": 5000.99,
      "repairsAndMaintenance": 5000.99,
      "financialCosts": 5000.99,
      "professionalFees": 5000.99,
      "costOfServices": 5000.99,
      "travelCosts": 5000.99,
      "other": 5000.99
    }
  },
  "foreignNonFhlProperty": [
    {
      "countryCode": "FRA",
      "income": {
        "rentIncome": {
          "rentAmount": 5000.99
        },
        "foreignTaxCreditRelief": false,
        "premiumsOfLeaseGrant": 5000.99,
        "otherPropertyIncome": 5000.99,
        "foreignTaxPaidOrDeducted": 5000.99,
        "specialWithholdingTaxOrUkTaxPaid": 5000.99
      },
      "expenses": {
        "premisesRunningCosts": 5000.99,
        "repairsAndMaintenance": 5000.99,
        "financialCosts": 5000.99,
        "professionalFees": 5000.99,
        "costOfServices": 5000.99,
        "travelCosts": 5000.99,
        "residentialFinancialCost": 5000.99,
        "broughtFwdResidentialFinancialCost": 5000.99,
        "other": 5000.99
      }
    }
  ]
}

201 
Example Response
Copy
{
"submissionId": "4557ecb5-fd32-48cc-81f5-e6acd1099f3c"
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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)
Maximum tax year supported is 2024-25.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
One of For TY 2023-24 and beforeFor TY 2024-25
fromDate
required
string <date>
The first day that the income and expenses period summary covers. Must conform to the format YYYY-MM-DD (Our systems only accept dates between 1900-01-01 and 2100-01-01)

toDate
required
string <date>
The last day that the income and expenses period summary covers. Must conform to the format YYYY-MM-DD (Our systems only accept dates between 1900-01-01 and 2100-01-01)

foreignFhlEea	
object
Object holding the income and expenses of the user's Furnished Holiday Lettings (FHL) in the European Economic Area (EEA) for the period.

foreignNonFhlProperty	
Array of objects
Array holding the income and expenses of the user's foreign property business - excluding Furnished Holiday Lettings (FHL) in the European Economic Area (EEA) - for the period.


-------------------------------------------------------------
Retrieve a Foreign Property Income & Expenses Period Summary

Retrieve a Foreign Property Income & Expenses Period Summary
This endpoint allows a developer to retrieve the income and expenses for a Foreign Property business, using the submission ID for either or both of Furnished Holiday Lettings (FHL) in the European Economic Area (EEA) and all other Foreign Property submissions. A National Insurance number, business ID, and tax year are required.

Note: This endpoint only supports submissions up to tax year 2024-25. New endpoints which support cumulative submission are provided for tax year 2025-26 onwards.

GET
https://test-api.service.hmrc.gov.uk/individuals/business/property/foreign/{nino}/{businessId}/period/{taxYear}/{submissionId}

RESPONSE EXAMPLE 200
{
  "submittedOn": "2021-06-17T10:59:47.544Z",
  "fromDate": "2020-01-01",
  "toDate": "2020-01-31",
  "foreignFhlEea": {
    "income": {
      "rentAmount": 200.22
    },
    "expenses": {
      "premisesRunningCosts": 100.25,
      "repairsAndMaintenance": 100.25,
      "financialCosts": 100.25,
      "professionalFees": 100.25,
      "costOfServices": 100.25,
      "travelCosts": 100.25,
      "other": 100.25
    }
  },
  "foreignNonFhlProperty": [
    {
      "countryCode": "FRA",
      "income": {
        "rentIncome": {
          "rentAmount": 200.22
        },
        "foreignTaxCreditRelief": true,
        "premiumsOfLeaseGrant": 100.25,
        "otherPropertyIncome": 100.25,
        "foreignTaxPaidOrDeducted": 44.21,
        "specialWithholdingTaxOrUkTaxPaid": 23.78
      },
      "expenses": {
        "premisesRunningCosts": 100.25,
        "repairsAndMaintenance": 100.25,
        "financialCosts": 200.25,
        "professionalFees": 100.25,
        "costOfServices": 100.25,
        "travelCosts": 100.25,
        "residentialFinancialCost": 100.25,
        "broughtFwdResidentialFinancialCost": 100.25,
        "other": 100.25
      }
    }
  ]
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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)
Maximum tax year supported is 2024-25.

submissionId
required
string^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][...Show pattern
Example: 4557ecb5-fd32-48cc-81f5-e6acd1099f3c
An identifier for the income and expenditure period summary.

Must conform to the regular expression ^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
Amend a Foreign Property Income & Expenses Period Summary
This endpoint allows a developer to amend the income and expenses for a foreign property business. This submission is for either or both of Furnished Holiday Letting (FHL) in the European Economic Area (EEA) and all other foreign property submissions. In the case of Non-FHL Foreign Property, if there are multiple properties per country, the income and expenses should be the total across all properties. A National Insurance number, business ID, tax year and submission ID are required.

Note: This endpoint only supports submissions up to tax year 2024-25. New endpoints which support cumulative submission are provided for tax year 2025-26 onwards.

PUT
https://test-api.service.hmrc.gov.uk/individuals/business/property/foreign/{nino}/{businessId}/period/{taxYear}/{submissionId}

PAYLOAD
{
  "foreignFhlEea": {
    "income": {
      "rentAmount": 1123.89
    },
    "expenses": {
      "premisesRunningCosts": 332.78,
      "repairsAndMaintenance": 231.45,
      "financialCosts": 345.23,
      "professionalFees": 232.45,
      "costOfServices": 231.56,
      "travelCosts": 234.67,
      "other": 3457.9
    }
  },
  "foreignNonFhlProperty": [
    {
      "countryCode": "AFG",
      "income": {
        "rentIncome": {
          "rentAmount": 440.31
        },
        "foreignTaxCreditRelief": false,
        "premiumsOfLeaseGrant": 950.48,
        "otherPropertyIncome": 802.49,
        "foreignTaxPaidOrDeducted": 734.18,
        "specialWithholdingTaxOrUkTaxPaid": 85.47
      },
      "expenses": {
        "premisesRunningCosts": 129.35,
        "repairsAndMaintenance": 7490.32,
        "financialCosts": 5000.99,
        "professionalFees": 847.9,
        "travelCosts": 69.2,
        "costOfServices": 478.23,
        "residentialFinancialCost": 879.28,
        "broughtFwdResidentialFinancialCost": 846.13,
        "other": 138.92
      }
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
National Insurance number, in the format AA999999A.

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
An identifier for the business, unique to the customer.

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)
Maximum tax year supported is 2024-25.

submissionId
required
string^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][...Show pattern
Example: 4557ecb5-fd32-48cc-81f5-e6acd1099f3c
An identifier for the income and expenditure period summary.

Must conform to the regular expression ^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
One of For TY 2023-24 and beforeFor TY 2024-25
foreignFhlEea	
object
Object holding the income and expenses of the user's Furnished Holiday Lettings (FHL) in the European Economic Area (EEA) for the period.

foreignNonFhlProperty	
Array of objects
Array holding the income and expenses of the user's foreign property business - excluding Furnished Holiday Lettings (FHL) in the European Economic Area (EEA) - for the period.

-----------------------------------------------------------

Retrieve a Foreign Property Cumulative Period Summary
This endpoint enables you to retrieve the cumulative period income and expenses for a foreign property business. A National Insurance number, business ID, and tax year are required.

Please note that this endpoint is only available for tax years starting from 2025-26.

GET
https://test-api.service.hmrc.gov.uk/individuals/business/property/foreign/{nino}/{businessId}/cumulative/{taxYear}

response example 200
{
  "submittedOn": "2026-07-07T10:59:47.544Z",
  "fromDate": "2026-04-06",
  "toDate": "2026-07-05",
  "foreignProperty": [
    {
      "propertyId": "8e8b8450-dc1b-4360-8109-7067337b42cb",
      "income": {
        "rentIncome": {
          "rentAmount": 440.31
        },
        "foreignTaxCreditRelief": false,
        "premiumsOfLeaseGrant": 950.48,
        "otherPropertyIncome": 802.49,
        "foreignTaxPaidOrDeducted": 734.18,
        "specialWithholdingTaxOrUkTaxPaid": 85.47
      },
      "expenses": {
        "premisesRunningCosts": -4929.5,
        "repairsAndMaintenance": -54.3,
        "financialCosts": 2090.35,
        "professionalFees": -90.2,
        "travelCosts": 560.99,
        "costOfServices": -100.83,
        "residentialFinancialCost": 857.78,
        "broughtFwdResidentialFinancialCost": 600.1,
        "other": 334.64
      }
    }
  ]
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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2025-26
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2025-26. No gaps are allowed, for example, 2025-27 is not valid.

query Parameters
propertyId	
string <uuid>
Example: propertyId=8e8b8450-dc1b-4360-8109-7067337b42cb
A unique identifier for each foreign property. This parameter is only supported for tax years 2026-27 onwards.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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

-----------------------------------------------------------
Create or Amend a Foreign Property Cumulative Period Summary
This endpoint enables you to submit the cumulative period income and expenses between two dates for a foreign property business. A National Insurance number, tax year and business ID are required.

Please note that this endpoint is only available for tax years starting from 2025-26.

PUT 
https://test-api.service.hmrc.gov.uk/individuals/business/property/foreign/{nino}/{businessId}/cumulative/{taxYear}

PAYLOAD
{
  "fromDate": "2026-04-06",
  "toDate": "2026-07-05",
  "foreignProperty": [
    {
      "propertyId": "8e8b8450-dc1b-4360-8109-7067337b42cb",
      "income": {
        "rentIncome": {
          "rentAmount": 4882.23
        },
        "foreignTaxCreditRelief": false,
        "premiumsOfLeaseGrant": 884.72,
        "otherPropertyIncome": 7713.09,
        "foreignTaxPaidOrDeducted": 884.12,
        "specialWithholdingTaxOrUkTaxPaid": 847.72
      },
      "expenses": {
        "premisesRunningCosts": 129.35,
        "repairsAndMaintenance": 7490.32,
        "financialCosts": 5000.99,
        "professionalFees": 847.9,
        "travelCosts": 69.2,
        "costOfServices": 478.23,
        "residentialFinancialCost": 879.28,
        "broughtFwdResidentialFinancialCost": 846.13,
        "other": 138.92
      }
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
National Insurance number, in the format AA999999A.

businessId
required
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: XAIS12345678910
An identifier for the business, unique to the customer.

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2025-26
The tax year to which the data applies. The start year and end year must not span two tax years. The minimum tax year is 2025-26. No gaps are allowed, for example, 2025-27 is not valid.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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
One of For TY 2025-26For TY 2026-27 and onwards
fromDate	
string <date>
The first day that the income and expenses period summary covers. Must conform to the format: YYYY-MM-DD.

For users with ITSA status of 'annual' or a latent income source, these dates are not required.

toDate	
string <date>
The last day that the income and expenses period summary covers. Must conform to the format: YYYY-MM-DD.

For users with ITSA status of 'annual' or a latent income source, these dates are not required.

foreignProperty
required
Array of objects (foreignPropertyEntry)
Array holding the income and expenses of the user's foreign property business for the period.

----------------------------------------------------------

List Property Income and Expenses Period Summaries
This endpoint enables you to list the period summaries associated with UK or foreign Properties. A National Insurance number, tax year and business ID are required.

Note: This endpoint only supports submissions up to tax year 2024-25. New endpoints which support cumulative submission are provided for tax year 2025-26 onwards.

GET
https://test-api.service.hmrc.gov.uk/individuals/business/property/{nino}/{businessId}/period/{taxYear}

response example 200
{
  "submissions": [
    {
      "submissionId": "4557ecb5-fd32-48cc-81f5-e6acd1099f3c",
      "fromDate": "2021-04-06",
      "toDate": "2021-07-05"
    },
    {
      "submissionId": "46954a50-5127-41ec-bf63-0242ac130002",
      "fromDate": "2021-07-06",
      "toDate": "2021-10-05"
    }
  ]
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

Must conform to the regular expression ^X[A-Z0-9]{1}IS[0-9]{11}$

taxYear
required
string
Example: 2022-23
The tax year to which the data applies. For example: 2022-23. The start year and end year must not span two tax years. The minimum tax year is 2022-23. No gaps are allowed, for example, 2022-24 is not valid. (The minimum tax year in Sandbox is 2021-22.)
Maximum tax year supported is 2024-25.

header Parameters
Accept
required
string
Value: "application/vnd.hmrc.6.0+json"
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

