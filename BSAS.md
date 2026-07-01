BSAS 

Business Source Adjustable Summary (MTD) API
HMRC monitors transactions to help protect your customers' confidential data from criminals and fraudsters.

! Warning You are required by law to submit header data for this API. This includes all associated APIs and endpoints.

self employment
1.Retrieve a Self-Employment Business Source Adjustable Summary
Retrieve a Self-Employment Business Source Adjustable Summary
This endpoint allows the user to request a specific Business Source Adjustable Summary. A National Insurance number and Calculation id must be provided.

GET
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/adjustable-summary/{nino}/self-employment/{calculationId}/{taxYear}

RESPONSE SAMPLE 200:
TY-2025-26-Full-Expenses
{
  "metadata": {
    "calculationId": "717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4",
    "requestedDateTime": "2021-01-01T10:10:10Z",
    "adjustedDateTime": "2021-01-02T10:10:10Z",
    "nino": "TC663795B",
    "taxYear": "2020-21",
    "summaryStatus": "valid"
  },
  "inputs": {
    "typeOfBusiness": "self-employment",
    "businessId": "XAIS12345678910",
    "businessName": "My self-employment",
    "accountingPeriodStartDate": "2020-04-06",
    "accountingPeriodEndDate": "2021-04-05",
    "source": "MTD-SA",
    "submissionPeriod": {
      "submissionId": "617f3a7a-db8e-11e9-8a34-2a2ae2dbeed4",
      "startDate": "2020-04-06",
      "endDate": "2020-07-05",
      "receivedDateTime": "2020-07-07T10:12:10.123Z"
    }
  },
  "adjustableSummaryCalculation": {
    "totalIncome": 0.12,
    "income": {
      "turnover": 0.12,
      "other": 0.12
    },
    "totalExpenses": -0.02,
    "expenses": {
      "costOfGoods": 0.12,
      "paymentsToSubcontractors": -0.12,
      "wagesAndStaffCosts": -0.12,
      "carVanTravelExpenses": -0.12,
      "premisesRunningCosts": 0.12,
      "maintenanceCosts": 0.12,
      "adminCosts": 0.12,
      "interestOnBankOtherLoans": 0.12,
      "financeCharges": 0.12,
      "irrecoverableDebts": 0.12,
      "professionalFees": 0.12,
      "depreciation": 0.12,
      "otherExpenses": 0.12,
      "advertisingCosts": 0.12,
      "businessEntertainmentCosts": 0.12
    },
    "netProfit": 0.12,
    "totalAdditions": 0.12,
    "adjustedProfit": 0.12,
    "outstandingBusinessIncome": 0.12,
    "additions": {
      "costOfGoodsDisallowable": 0.12,
      "paymentsToSubcontractorsDisallowable": -0.12,
      "wagesAndStaffCostsDisallowable": -0.12,
      "carVanTravelExpensesDisallowable": -0.12,
      "premisesRunningCostsDisallowable": 0.12,
      "maintenanceCostsDisallowable": 0.12,
      "adminCostsDisallowable": 0.12,
      "interestOnBankOtherLoansDisallowable": 0.12,
      "financeChargesDisallowable": 0.12,
      "irrecoverableDebtsDisallowable": 0.12,
      "professionalFeesDisallowable": 0.12,
      "depreciationDisallowable": 0.12,
      "otherExpensesDisallowable": 0.12,
      "advertisingCostsDisallowable": 0.12,
      "businessEntertainmentCostsDisallowable": 0.12,
      "balancingChargeOther": 0.12,
      "balancingChargeBpra": 0.12,
      "goodsAndServicesOwnUse": 0.12
    },
    "totalDeductions": 0.12,
    "deductions": {
      "annualInvestmentAllowance": 0.12,
      "capitalAllowanceMainPool": 0.12,
      "capitalAllowanceSpecialRatePool": 0.12,
      "zeroEmissionGoods": 0.12,
      "businessPremisesRenovationAllowance": 0.12,
      "enhancedCapitalAllowance": 0.12,
      "allowanceOnSales": 0.12,
      "capitalAllowanceSingleAssetPool": 0.12,
      "includedNonTaxableProfits": 0.12,
      "structuredBuildingAllowance": 0.12,
      "enhancedStructuredBuildingAllowance": 0.12,
      "zeroEmissionsCarAllowance": 0.12
    },
    "totalAccountingAdjustments": 0.12,
    "accountingAdjustments": {
      "basisAdjustment": 0.12,
      "accountingAdjustment": 0.12
    },
    "taxableProfit": 100
  },
  "adjustments": {
    "income": {
      "turnover": 100.01,
      "other": 100.02
    },
    "expenses": {
      "costOfGoods": 100.04,
      "paymentsToSubcontractors": 100.05,
      "wagesAndStaffCosts": 100.06,
      "carVanTravelExpenses": 100.01,
      "premisesRunningCosts": 99999999999.99,
      "maintenanceCosts": -99999999999.99,
      "adminCosts": 0.12,
      "interestOnBankOtherLoans": -0.01,
      "financeCharges": 100.5,
      "irrecoverableDebts": 100.5,
      "professionalFees": 100.5,
      "depreciation": 100.5,
      "otherExpenses": 100.5,
      "advertisingCosts": 100.5,
      "businessEntertainmentCosts": 100.5
    },
    "additions": {
      "costOfGoodsDisallowable": 100.45,
      "paymentsToSubcontractorsDisallowable": 100.45,
      "wagesAndStaffCostsDisallowable": 100.45,
      "carVanTravelExpensesDisallowable": 100.45,
      "premisesRunningCostsDisallowable": 100.45,
      "maintenanceCostsDisallowable": 100.45,
      "adminCostsDisallowable": 100.45,
      "interestOnBankOtherLoansDisallowable": 100.45,
      "financeChargesDisallowable": 100.45,
      "irrecoverableDebtsDisallowable": 100.45,
      "professionalFeesDisallowable": 100.45,
      "depreciationDisallowable": 100.45,
      "otherExpensesDisallowable": 100.45,
      "advertisingCostsDisallowable": 100.45,
      "businessEntertainmentCostsDisallowable": 100.45
    }
  },
  "adjustedSummaryCalculation": {
    "totalIncome": 0.12,
    "income": {
      "turnover": 0.12,
      "other": 0.12
    },
    "totalExpenses": 0.12,
    "expenses": {
      "costOfGoods": 0.12,
      "paymentsToSubcontractors": 0.12,
      "wagesAndStaffCosts": 0.12,
      "carVanTravelExpenses": 0.12,
      "premisesRunningCosts": 0.12,
      "maintenanceCosts": 0.12,
      "adminCosts": 0.12,
      "interestOnBankOtherLoans": 0.12,
      "financeCharges": 0.12,
      "irrecoverableDebts": 0.12,
      "professionalFees": 0.12,
      "depreciation": 0.12,
      "otherExpenses": 0.12,
      "advertisingCosts": 0.12,
      "businessEntertainmentCosts": 0.12
    },
    "netProfit": 0.12,
    "totalAdditions": 0.12,
    "adjustedProfit": 0.12,
    "outstandingBusinessIncome": 0.12,
    "additions": {
      "costOfGoodsDisallowable": 0.12,
      "paymentsToSubcontractorsDisallowable": 0.12,
      "wagesAndStaffCostsDisallowable": 0.12,
      "carVanTravelExpensesDisallowable": 0.12,
      "premisesRunningCostsDisallowable": 0.12,
      "maintenanceCostsDisallowable": 0.12,
      "adminCostsDisallowable": 0.12,
      "interestOnBankOtherLoansDisallowable": 0.12,
      "financeChargesDisallowable": 0.12,
      "irrecoverableDebtsDisallowable": 0.12,
      "professionalFeesDisallowable": 0.12,
      "depreciationDisallowable": 0.12,
      "otherExpensesDisallowable": 0.12,
      "advertisingCostsDisallowable": 0.12,
      "businessEntertainmentCostsDisallowable": 0.12,
      "balancingChargeOther": 0.12,
      "balancingChargeBpra": 0.12,
      "goodsAndServicesOwnUse": 0.12
    },
    "totalDeductions": 0.12,
    "deductions": {
      "annualInvestmentAllowance": 0.12,
      "capitalAllowanceMainPool": 0.12,
      "capitalAllowanceSpecialRatePool": 0.12,
      "zeroEmissionGoods": 0.12,
      "businessPremisesRenovationAllowance": 0.12,
      "enhancedCapitalAllowance": 0.12,
      "allowanceOnSales": 0.12,
      "capitalAllowanceSingleAssetPool": 0.12,
      "includedNonTaxableProfits": 0.12,
      "structuredBuildingAllowance": 0.12,
      "enhancedStructuredBuildingAllowance": 0.12,
      "zeroEmissionsCarAllowance": 0.12
    },
    "totalAccountingAdjustments": 0.12,
    "accountingAdjustments": {
      "basisAdjustment": 0.12,
      "accountingAdjustment": 0.12
    },
    "taxableProfit": 100
  }
}



In each case where a scenario is prefixed by DYNAMIC_, the following response values will change based on the values submitted in the request:

metadata
calculationId
taxYear
nino
requestedDateTime
adjustedDateTime
inputs
accountingPeriodStartDate
accountingPeriodEndDate
submissionPeriods
startDate
endDate
For tax years prior to 2023-24, when the tax year is not supplied, these values will be based on a tax year of 2022-23.

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

calculationId
required
string^[0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-...Show pattern
Example: 717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4
The unique identifier of the summary calculation.

taxYear
required
string^\d{4}-\d{2}$
Example: 2023-24
The tax year to which the data applies in the format YYYY-YY. The range must not be greater than a single year. For example, 2023-25 is not valid.

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
-------------------------------------------------------------------
2.Submit Self-Employment Accounting Adjustments
This endpoint allows the user to provide accounting adjustments against a specified Business Source Accounting Summary quoting its unique identifier. The calculation ID quoted must be for a Self-Employment Business and it must not have been adjusted previously. A National Insurance number and calculation ID must be provided.

POST
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/adjustable-summary/{nino}/self-employment/{calculationId}/adjust/{taxYear}

PAYLOAD
Consolidated Expenses request for TY 2024-25 and after
{
"income": {
"turnover": -599.99,
"other": 454544.59
},
"expenses": {
"consolidatedExpenses": 45645.23
}
}

Zero Adjustments request for TY 2024-25 and after
{
"zeroAdjustments": true
}

Full Expenses request for TY 2024-25 and after
{
  "income": {
    "turnover": -599.99,
    "other": 454544.59
  },
  "expenses": {
    "costOfGoods": 3353.39,
    "paymentsToSubcontractors": 35353.19,
    "wagesAndStaffCosts": 24232.23,
    "carVanTravelExpenses": 3563.77,
    "premisesRunningCosts": 35635.34,
    "maintenanceCosts": 35333.22,
    "adminCosts": 24242.45,
    "interestOnBankOtherLoans": 34535.34,
    "financeCharges": 42342.56,
    "irrecoverableDebts": 54353.23,
    "professionalFees": 23421.23,
    "depreciation": 24222.56,
    "otherExpenses": 35435.23,
    "advertisingCosts": 34223.33,
    "businessEntertainmentCosts": 3543.78
  },
  "additions": {
    "costOfGoodsDisallowable": 5464.56,
    "paymentsToSubcontractorsDisallowable": 5643.23,
    "wagesAndStaffCostsDisallowable": 3453.78,
    "carVanTravelExpensesDisallowable": 53533.23,
    "premisesRunningCostsDisallowable": 2433.23,
    "maintenanceCostsDisallowable": 2342.53,
    "adminCostsDisallowable": 42342.34,
    "interestOnBankOtherLoansDisallowable": 2342.34,
    "financeChargesDisallowable": 23424.34,
    "irrecoverableDebtsDisallowable": 23424.23,
    "professionalFeesDisallowable": 34222.23,
    "depreciationDisallowable": 2342.54,
    "otherExpensesDisallowable": 24232.34,
    "advertisingCostsDisallowable": 23121.23,
    "businessEntertainmentCostsDisallowable": 6575.56
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
National Insurance number, in the format AA999999A

calculationId
required
string^[0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-...Show pattern
Example: 717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4
The unique identifier of the summary calculation.

taxYear
required
string^\d{4}-\d{2}$
Example: 2023-24
The tax year to which the data applies in the format YYYY-YY. The range must not be greater than a single year. For example, 2023-25 is not valid.

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

Request Body schema: application/json
One of For TY 2023-24 and beforeFor TY 2024-25 and after
income	
object (seIncome)
Object containing the adjustments to income values.

expenses	
object (seExpenses)
Object containing the adjustments to expenses values.

additions	
object (seAdditions)
An object containing the adjustments to additions values.
---------------------------------------------------------------

UK property business
3.Retrieve a UK Property Business Source Adjustable Summary
This endpoint allows the user to request a specific Business Source Adjustable Summary for a UK property business Furnished Holiday Letting (FHL) or a UK property. A National Insurance number and Calculation id must be provided.

GET
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/adjustable-summary/{nino}/uk-property/{calculationId}/{taxYear}

RESPONSE SAMPLE 200
TY-2025-26-UK-Property-Response
{
  "metadata": {
    "calculationId": "717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4",
    "requestedDateTime": "2020-12-05T16:19:44Z",
    "adjustedDateTime": "2020-12-05T16:19:44Z",
    "nino": "TC663795B",
    "taxYear": "2019-20",
    "summaryStatus": "valid"
  },
  "inputs": {
    "businessId": "XAIS12345678910",
    "businessName": "My uk property business",
    "accountingPeriodStartDate": "2019-04-06",
    "accountingPeriodEndDate": "2020-04-05",
    "source": "MTD-SA",
    "submissionPeriod": {
      "submissionId": "4557ecb5-fd32-48cc-81f5-e6acd1099f3c",
      "startDate": "2019-04-06",
      "endDate": "2020-04-05",
      "receivedDateTime": "2019-02-15T09:35:04.843Z"
    }
  },
  "adjustableSummaryCalculation": {
    "totalIncome": 0.12,
    "income": {
      "totalRentsReceived": 0.12,
      "premiumsOfLeaseGrant": 0.12,
      "reversePremiums": 0.12,
      "otherPropertyIncome": 0.12,
      "rarRentReceived": 0.12
    },
    "totalExpenses": 0.12,
    "expenses": {
      "premisesRunningCosts": -509.67,
      "repairsAndMaintenance": 50,
      "financialCosts": -67.98,
      "professionalFees": 100,
      "costOfServices": 156001.76,
      "travelCosts": 82.78,
      "residentialFinancialCost": 98,
      "broughtFwdResidentialFinancialCost": 0.12,
      "other": 88.12
    },
    "netProfit": 0.12,
    "totalAdditions": 0.12,
    "additions": {
      "privateUseAdjustment": 0.12,
      "balancingCharge": 0.12,
      "bpraBalancingCharge": 0.12
    },
    "totalDeductions": 0.12,
    "deductions": {
      "zeroEmissionGoods": 0.12,
      "annualInvestmentAllowance": 0.12,
      "costOfReplacingDomesticItems": 0.12,
      "businessPremisesRenovationAllowance": 0.12,
      "otherCapitalAllowance": 0.12,
      "rarReliefClaimed": 0.12,
      "structuredBuildingAllowance": 0.12,
      "enhancedStructuredBuildingAllowance": 0.12,
      "zeroEmissionsCarAllowance": 0.12
    },
    "taxableProfit": 12500
  },
  "adjustments": {
    "income": {
      "totalRentsReceived": 0.12,
      "premiumsOfLeaseGrant": 0.12,
      "reversePremiums": 0.12,
      "otherPropertyIncome": 0.12
    },
    "expenses": {
      "premisesRunningCosts": 0.12,
      "repairsAndMaintenance": 0.12,
      "financialCosts": 0.12,
      "professionalFees": 0.12,
      "costOfServices": 0.12,
      "residentialFinancialCost": 0.12,
      "other": 0.12,
      "travelCosts": 0.12
    }
  },
  "adjustedSummaryCalculation": {
    "totalIncome": 0.12,
    "income": {
      "totalRentsReceived": 0.12,
      "premiumsOfLeaseGrant": 0.12,
      "reversePremiums": 0.12,
      "otherPropertyIncome": 0.12,
      "rarRentReceived": 0.12
    },
    "totalExpenses": 0.12,
    "expenses": {
      "premisesRunningCosts": 9.67,
      "repairsAndMaintenance": 50,
      "financialCosts": 67.98,
      "professionalFees": 100,
      "costOfServices": 156001.76,
      "travelCosts": 82.78,
      "residentialFinancialCost": 98,
      "broughtFwdResidentialFinancialCost": 0.12,
      "other": -88.12
    },
    "netProfit": 0.12,
    "totalAdditions": 0.12,
    "additions": {
      "privateUseAdjustment": 0.12,
      "balancingCharge": 0.12,
      "bpraBalancingCharge": 0.12
    },
    "totalDeductions": 0.12,
    "deductions": {
      "zeroEmissionGoods": 0.12,
      "annualInvestmentAllowance": 0.12,
      "costOfReplacingDomesticItems": 0.12,
      "businessPremisesRenovationAllowance": 0.12,
      "otherCapitalAllowance": 0.12,
      "rarReliefClaimed": 0.12,
      "structuredBuildingAllowance": 0.12,
      "enhancedStructuredBuildingAllowance": 0.12,
      "zeroEmissionsCarAllowance": 0.12
    },
    "taxableProfit": 22500
  }
}

In each case where a scenario is prefixed by DYNAMIC_, the following response values will change based on the values submitted in the request:

metadata
calculationId
taxYear
nino
requestedDateTime
adjustedDateTime
inputs
accountingPeriodStartDate
accountingPeriodEndDate
submissionPeriods
startDate
endDate
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

calculationId
required
string^[0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-...Show pattern
Example: 717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4
The unique identifier of the summary calculation.

taxYear
required
string^\d{4}-\d{2}$
Example: 2023-24
The tax year to which the data applies in the format YYYY-YY. The range must not be greater than a single year. For example, 2023-25 is not valid.

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
----------------------------------------------------------------
4.Submit UK Property Accounting Adjustments

This endpoint allows the user to provide accounting adjustments against a specified Business Source Accounting Summary quoting its unique identifier. The calculation ID quoted must be for a UK Property Business, and it must not have been adjusted previously. Only data for one property business (either FHL or Non-FHL) should be included in any submission. A National Insurance number and calculation ID must be provided.

POST
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/adjustable-summary/{nino}/uk-property/{calculationId}/adjust/{taxYear}

PAYLOAD
UK Property with Consolidated Expenses for TY-2025-26 and after
{
"ukProperty": {
"income": {},
"expenses": {}
}
}

UK Property with Full Expenses for TY 2025-26 and after
{
"ukProperty": {
"income": {},
"expenses": {}
}
}

Zero Adjustments request for TY 2025-26 and after
{
"ukProperty": {
"zeroAdjustments": true
}
}

Authorizations:
User-Restricted
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A



calculationId
required
string^[0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-...Show pattern
Example: 717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4
The unique identifier of the summary calculation.

taxYear
required
string^\d{4}-\d{2}$
Example: 2023-24
The tax year to which the data applies in the format YYYY-YY. The range must not be greater than a single year. For example, 2023-25 is not valid.

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

Request Body schema: application/json
One of For TY 2023-24 and beforeFor TY 2024-25For TY 2025-26 and after
ukProperty	
object
Object holding UK Property adjustments.

furnishedHolidayLet	
object
Object holding FHL adjustments.

-----------------------------------------------------------------
Foreign property business
5.Retrieve a Foreign Property Business Source Adjustable Summary

This endpoint enables you to request a specific Business Source Adjustable Summary for a foreign property business EEA Furnished Holiday Letting (FHL) or a non-FHL foreign property business. A National Insurance number and calculation ID must be provided.

Please note that the expense items 'residentialFinancialCost' and 'broughtFwdResidentialFinancialCost' under 'adjustableSummaryCalculation' and 'adjustedSummaryCalculation' are not currently in use and will not be returned in a live environment. These fields will be removed in the near future.

GET
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/adjustable-summary/{nino}/foreign-property/{calculationId}/{taxYear}

RESPONSE SAMPLE 200
TY-2025-26-Foreign-Property
{
  "metadata": {
    "calculationId": "717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4",
    "requestedDateTime": "2020-12-05T16:19:44Z",
    "adjustedDateTime": "2020-12-05T16:19:44Z",
    "nino": "AA999999A",
    "taxYear": "2019-20",
    "summaryStatus": "valid"
  },
  "inputs": {
    "businessId": "XAIS12345678910",
    "businessName": "My foreign property business",
    "accountingPeriodStartDate": "2019-04-06",
    "accountingPeriodEndDate": "2020-04-05",
    "source": "MTD-SA",
    "submissionPeriod": {
      "submissionId": "617f3a7a-db8e-11e9-8a34-2a2ae2dbeed4",
      "startDate": "2019-04-06",
      "endDate": "2020-04-05",
      "receivedDateTime": "2019-02-15T09:35:04.843Z"
    }
  },
  "adjustableSummaryCalculation": {
    "totalIncome": 0.12,
    "income": {
      "totalRentsReceived": 0.12,
      "premiumsOfLeaseGrant": 0.12,
      "otherPropertyIncome": 0.12
    },
    "totalExpenses": 0.12,
    "expenses": {
      "premisesRunningCosts": -509.67,
      "repairsAndMaintenance": 50,
      "financialCosts": -67.98,
      "professionalFees": 100,
      "costOfServices": 156001.76,
      "travelCosts": 82.78,
      "residentialFinancialCost": 98,
      "broughtFwdResidentialFinancialCost": 0.12,
      "other": 88.12
    },
    "netProfit": 0.12,
    "totalAdditions": 0.12,
    "additions": {
      "privateUseAdjustment": 0.12,
      "balancingCharge": 0.12
    },
    "totalDeductions": 0.12,
    "deductions": {
      "annualInvestmentAllowance": 0.12,
      "costOfReplacingDomesticItems": 0.12,
      "zeroEmissionGoods": 0.12,
      "otherCapitalAllowance": 0.12,
      "structuredBuildingAllowance": 0.12,
      "zeroEmissionsCarAllowance": 0.12
    },
    "taxableProfit": 2500,
    "countryLevelDetail": [
      {
        "countryCode": "CYM",
        "totalIncome": 0.12,
        "income": {
          "totalRentsReceived": 0.12,
          "premiumsOfLeaseGrant": 0.12,
          "otherPropertyIncome": 0.12
        },
        "totalExpenses": -3000.87,
        "expenses": {
          "premisesRunningCosts": 0.12,
          "repairsAndMaintenance": 0.12,
          "financialCosts": 0.12,
          "professionalFees": 0.12,
          "travelCosts": 0.12,
          "costOfServices": 0.12,
          "residentialFinancialCost": 0.12,
          "broughtFwdResidentialFinancialCost": 0.12,
          "other": 0.12
        },
        "netProfit": 0.12,
        "totalAdditions": 0.12,
        "additions": {
          "privateUseAdjustment": 0.12,
          "balancingCharge": 0.12
        },
        "totalDeductions": 0.12,
        "deductions": {
          "annualInvestmentAllowance": 0.12,
          "costOfReplacingDomesticItems": 0.12,
          "zeroEmissionGoods": 0.12,
          "otherCapitalAllowance": 0.12,
          "structuredBuildingAllowance": 0.12,
          "zeroEmissionsCarAllowance": 0.12
        },
        "taxableProfit": 0.12
      }
    ]
  },
  "adjustments": {
    "countryLevelDetail": [
      {
        "countryCode": "CYM",
        "income": {
          "totalRentsReceived": 99999999999.99,
          "premiumsOfLeaseGrant": 99999999999.99,
          "otherPropertyIncome": 99999999999.99
        },
        "expenses": {
          "premisesRunningCosts": 99999999999.99,
          "repairsAndMaintenance": 99999999999.99,
          "financialCosts": 99999999999.99,
          "professionalFees": 99999999999.99,
          "travelCosts": 99999999999.99,
          "costOfServices": 99999999999.99,
          "residentialFinancialCost": 99999999999.99,
          "other": 99999999999.99
        }
      }
    ]
  },
  "adjustedSummaryCalculation": {
    "totalIncome": 0.12,
    "income": {
      "totalRentsReceived": 0.12,
      "premiumsOfLeaseGrant": 0.12,
      "otherPropertyIncome": 0.12
    },
    "totalExpenses": 0.12,
    "expenses": {
      "premisesRunningCosts": -0.12,
      "repairsAndMaintenance": 0.12,
      "financialCosts": 0.12,
      "professionalFees": 0.12,
      "travelCosts": -0.12,
      "costOfServices": 0.12,
      "residentialFinancialCost": 0.12,
      "broughtFwdResidentialFinancialCost": 0.12,
      "other": 0.12
    },
    "netProfit": 0.12,
    "totalAdditions": 0.12,
    "additions": {
      "privateUseAdjustment": 0.12,
      "balancingCharge": 0.12
    },
    "totalDeductions": 0.12,
    "deductions": {
      "annualInvestmentAllowance": 0.12,
      "costOfReplacingDomesticItems": 0.12,
      "zeroEmissionGoods": 0.12,
      "otherCapitalAllowance": 0.12
    },
    "taxableProfit": 2500,
    "countryLevelDetail": [
      {
        "countryCode": "CYM",
        "totalIncome": 0.12,
        "income": {
          "totalRentsReceived": 0.12,
          "premiumsOfLeaseGrant": 0.12,
          "otherPropertyIncome": 0.12
        },
        "totalExpenses": 0.12,
        "expenses": {
          "premisesRunningCosts": -509.67,
          "repairsAndMaintenance": 50,
          "financialCosts": -67.98,
          "professionalFees": 100,
          "costOfServices": 156001.76,
          "travelCosts": 82.78,
          "residentialFinancialCost": 98,
          "broughtFwdResidentialFinancialCost": 0.12,
          "other": 88.12
        },
        "netProfit": 0.12,
        "totalAdditions": 0.12,
        "additions": {
          "privateUseAdjustment": 0.12,
          "balancingCharge": 0.12
        },
        "totalDeductions": 0.12,
        "deductions": {
          "annualInvestmentAllowance": 0.12,
          "costOfReplacingDomesticItems": 0.12,
          "zeroEmissionGoods": 0.12,
          "otherCapitalAllowance": 0.12
        },
        "taxableProfit": 0.12
      }
    ]
  }
}

In each case where a scenario is prefixed by DYNAMIC_, the following response values will change based on the values submitted in the request:

metadata
calculationId
taxYear
nino
requestedDateTime
adjustedDateTime
inputs
accountingPeriodStartDate
accountingPeriodEndDate
submissionPeriods
startDate
endDate
receivedDateTime
For tax years prior to 2023-24, when the tax year is not supplied, these values will be based on a tax year of 2022-23.

Authorizations:
User-Restricted
path Parameters
nino
required
string
Example: TC663795B
National Insurance number, in the format AA999999A

calculationId
required
string^[0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-...Show pattern
Example: 717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4
The unique identifier of the summary calculation.

taxYear
required
string^\d{4}-\d{2}$
Example: 2023-24
The tax year to which the data applies in the format YYYY-YY. The range must not be greater than a single year. For example, 2023-25 is not valid.

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
------------------------------------------------------------------
6.Submit Foreign Property Accounting Adjustments

Submit Foreign Property Accounting Adjustments
This endpoint allows the user to provide accounting adjustments against a specified Business Source Accounting Summary quoting its unique identifier. The calculation ID quoted must be for a Foreign Property Business, and it must not have been adjusted previously. Only data for one property business either foreign property (FHL EEA) or foreign property (Non FHL) should be included in any submission. A National Insurance number and calculation ID must be provided.

POST
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/adjustable-summary/{nino}/foreign-property/{calculationId}/adjust/{taxYear}

PAYLOAD
TY-2025-26 - Foreign Property Adjustment
{
  "foreignProperty": {
    "countryLevelDetail": [
      {
        "countryCode": "FRA",
        "income": {
          "totalRentsReceived": 1000.45,
          "premiumsOfLeaseGrant": -99.99,
          "otherPropertyIncome": 1000
        },
        "expenses": {
          "premisesRunningCosts": 1000.45,
          "repairsAndMaintenance": -99999.99,
          "financialCosts": 5000.45,
          "professionalFees": 300.99,
          "costOfServices": 500,
          "residentialFinancialCost": 9000,
          "other": 1000,
          "travelCosts": 99.99
        }
      }
    ]
  }
}

TY-2025-26 - Foreign Property Consolidated Adjustment

Copy
Expand allCollapse all
{
"foreignProperty": {
"countryLevelDetail": [
{
"countryCode": "FRA",
"income": {
"totalRentsReceived": 1000.45,
"premiumsOfLeaseGrant": -99.99,
"otherPropertyIncome": 1000
},
"expenses": {
"consolidatedExpenses": 999.99,
"residentialFinancialCost": 999.99
}
}
]
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
National Insurance number, in the format AA999999A

calculationId
required
string^[0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-...Show pattern
Example: 717f3a7a-db8e-11e9-8a34-2a2ae2dbcce4
The unique identifier of the summary calculation.

taxYear
required
string^\d{4}-\d{2}$
Example: 2023-24
The tax year to which the data applies in the format YYYY-YY. The range must not be greater than a single year. For example, 2023-25 is not valid.

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

Request Body schema: application/json
One of For TY 2023-24 and beforeFor TY 2024-25For TY 2025-26For TY 2026-27 and after
foreignProperty	
Array of objects
Array containing foreign Non-FHL adjustments.

foreignFhlEea	
object
Object holding FHL EEA adjustments.

----------------------------------------------------------------
7.List Business Source Adjustable Summaries

This endpoint allows the user to generate a list of Business Source Adjustable Summaries for a given tax year. A filter can be set to return the summaries for a single business or business type. The National Insurance number must be provided.

GET
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/adjustable-summary/{nino}/{taxYear}

response sample 200
For TY 2025-26 and after

{
  "businessSources": [
    {
      "businessId": "XBIS12345678901",
      "typeOfBusiness": "self-employment",
      "accountingPeriod": {
        "startDate": "2018-10-11",
        "endDate": "2019-10-10"
      },
      "taxYear": "2019-20",
      "summaries": [
        {
          "calculationId": "76350054-0f11-4024-a811-99bcf5ced792",
          "requestedDateTime": "2019-10-14T11:33:27Z",
          "summaryStatus": "valid",
          "adjustedSummary": false
        },
        {
          "calculationId": "ef1a6fd7-3faa-4323-9a9d-fe5cc8ed1c43",
          "requestedDateTime": "2019-10-10T09:01:35Z",
          "summaryStatus": "superseded",
          "adjustedSummary": true,
          "adjustedDateTime": "2019-10-11T09:01:35Z"
        }
      ]
    },
    {
      "businessId": "XBIS12345678902",
      "typeOfBusiness": "uk-property",
      "accountingPeriod": {
        "startDate": "2025-04-06",
        "endDate": "2026-04-05"
      },
      "taxYear": "2025-26",
      "summaries": [
        {
          "calculationId": "56f0a4fe-cfa7-4a21-8aa8-6c8f4642b792",
          "requestedDateTime": "2020-05-14T12:17:15Z",
          "summaryStatus": "valid",
          "adjustedSummary": false
        },
        {
          "calculationId": "7f1fd081-3f59-4fd6-9b1c-c90521e0f7a8",
          "requestedDateTime": "2020-04-10T13:03:17Z",
          "summaryStatus": "superseded",
          "adjustedSummary": true,
          "adjustedDateTime": "2020-04-11T13:03:17Z"
        }
      ]
    },
    {
      "businessId": "XBIS12345678915",
      "typeOfBusiness": "foreign-property",
      "accountingPeriod": {
        "startDate": "2021-04-06",
        "endDate": "2022-04-05"
      },
      "taxYear": "2019-20",
      "summaries": [
        {
          "calculationId": "16332284-c01b-4046-a055-6c00454467a2",
          "requestedDateTime": "2022-05-14T12:17:15Z",
          "summaryStatus": "valid",
          "adjustedSummary": false
        },
        {
          "calculationId": "7ef31d49-ce57-4622-94fc-f4248b72b2cd",
          "requestedDateTime": "2020-04-10T13:03:17Z",
          "summaryStatus": "superseded",
          "adjustedSummary": true,
          "adjustedDateTime": "2020-04-11T13:03:17Z"
        }
      ]
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
National Insurance number, in the format AA999999A

taxYear
required
string^\d{4}-\d{2}$
Example: 2023-24
The tax year to which the data applies in the format YYYY-YY. The range must not be greater than a single year. For example, 2023-25 is not valid.

query Parameters
typeOfBusiness	
string
Enum: "self-employment" "uk-property-fhl" "uk-property" "foreign-property-fhl-eea" "foreign-property"
Example: typeOfBusiness=foreign-property
The type of business the summary calculation is for.

Limited to the following possible values for tax years 2024-25 and before:

foreign-property-fhl-eea
foreign-property
uk-property
uk-property-fhl
self-employment
Limited to the following possible values for tax year 2025-26 onwards:

foreign-property
uk-property
self-employment
businessId	
string^X[A-Z0-9]{1}IS[0-9]{11}$
Example: businessId=XBIS12345678901
An identifier for the business, unique to the customer.

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


---------------------------------------------------------------
8.Trigger a Business Source Adjustable Summary

This endpoint allows a developer to generate an end of accounting period Business Source Adjustable Summary of the income and expenditure for a specified business for a given accounting period. A Business Source Adjustable Summary must be generated before accounting adjustments are to be entered. A National Insurance number must be provided.

Note: For tax years before 2025-26, data can be submitted for UK FHL or Non-FHL, Foreign EEA-FHL or Non-FHL property business types. From tax year 2025-26 onwards, the UK FHL, UK Non-FHL, Foreign EEA-FHL and Non-FHL property types are no longer valid and you must use the UK Property or Foreign Property type.

POST
https://test-api.service.hmrc.gov.uk/individuals/self-assessment/adjustable-summary/{nino}/trigger

PAYLOAD
UK Property Trigger for TY 2025-26 and after
{
"accountingPeriod": {
"startDate": "2025-04-06",
"endDate": "2026-04-05"
},
"typeOfBusiness": "uk-property",
"businessId": "X9IS98470026982"
}

Foreign Property Trigger for TY 2025-26 and after

{
"accountingPeriod": {
"startDate": "2025-04-06",
"endDate": "2026-04-05"
},
"typeOfBusiness": "foreign-property",
"businessId": "X9IS98470026982"
}

RESPONSE SAMPLE 200
{
"calculationId": "c75f40a6-a3df-4429-a697-471eeec46435"
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

Request Body schema: application/json
One of For TY 2024-25 and beforeFor TY 2025-26 and after
accountingPeriod
required
object (The accounting period)
The duration of the business income source operations to be included in the tax year submission. The earliest tax year to which the accounting period can be assigned is 2019-20 for self-employment and UK property, and for foreign property, it is 2021-22.

Note: Accounting period start and end dates should not be displayed to users of your software.

typeOfBusiness
required
string (typeOfBusiness)
Enum: "self-employment" "uk-property-fhl" "uk-property" "foreign-property-fhl-eea" "foreign-property"
The type of business the summary calculation is for.

businessId
required
string (businessId) ^X[A-Z0-9]{1}IS[0-9]{11}$
An identifier for the business, unique to the customer.