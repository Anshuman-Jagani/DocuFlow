#!/usr/bin/env python3
"""
Script to update Postman collection with Day 5 endpoints
Adds Invoices, Resumes, Contracts, and Receipts sections
"""

import json
import sys

def create_invoice_endpoints():
    """Create Invoice folder with 5 endpoints"""
    return {
        "name": "Invoices",
        "description": "Invoice management endpoints with statistics and filtering",
        "item": [
            {
                "name": "List Invoices",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/invoices?page=1&limit=20",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "invoices"],
                        "query": [
                            {"key": "page", "value": "1"},
                            {"key": "limit", "value": "20"},
                            {"key": "status", "value": "pending", "disabled": True},
                            {"key": "vendor_name", "value": "", "disabled": True},
                            {"key": "start_date", "value": "2024-01-01", "disabled": True},
                            {"key": "end_date", "value": "2024-12-31", "disabled": True},
                            {"key": "sort_by", "value": "invoice_date", "disabled": True},
                            {"key": "sort_order", "value": "DESC", "disabled": True}
                        ]
                    },
                    "description": "Get paginated list of invoices with filtering by status, vendor, and date range"
                },
                "response": []
            },
            {
                "name": "Get Invoice",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/invoices/{{invoiceId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "invoices", "{{invoiceId}}"]
                    },
                    "description": "Get single invoice by ID with document details"
                },
                "response": []
            },
            {
                "name": "Update Invoice",
                "request": {
                    "method": "PUT",
                    "header": [{"key": "Content-Type", "value": "application/json"}],
                    "body": {
                        "mode": "raw",
                        "raw": json.dumps({
                            "status": "paid",
                            "total_amount": 1500.00,
                            "notes": "Payment received"
                        }, indent=2)
                    },
                    "url": {
                        "raw": "{{baseUrl}}/api/invoices/{{invoiceId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "invoices", "{{invoiceId}}"]
                    },
                    "description": "Update invoice fields"
                },
                "response": []
            },
            {
                "name": "Delete Invoice",
                "request": {
                    "method": "DELETE",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/invoices/{{invoiceId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "invoices", "{{invoiceId}}"]
                    },
                    "description": "Delete invoice"
                },
                "response": []
            },
            {
                "name": "Get Invoice Statistics",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/invoices/stats",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "invoices", "stats"],
                        "query": [
                            {"key": "start_date", "value": "2024-01-01", "disabled": True},
                            {"key": "end_date", "value": "2024-12-31", "disabled": True}
                        ]
                    },
                    "description": "Get invoice statistics (total amount, count by status, by currency)"
                },
                "response": []
            }
        ]
    }

def create_resume_endpoints():
    """Create Resume folder with 5 endpoints"""
    return {
        "name": "Resumes",
        "description": "Resume management with job matching algorithm",
        "item": [
            {
                "name": "List Resumes",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/resumes?page=1&limit=20",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "resumes"],
                        "query": [
                            {"key": "page", "value": "1"},
                            {"key": "limit", "value": "20"},
                            {"key": "candidate_name", "value": "", "disabled": True},
                            {"key": "email", "value": "", "disabled": True},
                            {"key": "min_experience", "value": "2", "disabled": True},
                            {"key": "max_experience", "value": "10", "disabled": True}
                        ]
                    },
                    "description": "Get paginated list of resumes with filtering"
                },
                "response": []
            },
            {
                "name": "Get Resume",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/resumes/{{resumeId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "resumes", "{{resumeId}}"]
                    },
                    "description": "Get single resume with job matching data"
                },
                "response": []
            },
            {
                "name": "Update Resume",
                "request": {
                    "method": "PUT",
                    "header": [{"key": "Content-Type", "value": "application/json"}],
                    "body": {
                        "mode": "raw",
                        "raw": json.dumps({
                            "candidate_name": "John Doe",
                            "candidate_email": "john@example.com",
                            "years_of_experience": 5
                        }, indent=2)
                    },
                    "url": {
                        "raw": "{{baseUrl}}/api/resumes/{{resumeId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "resumes", "{{resumeId}}"]
                    },
                    "description": "Update resume fields"
                },
                "response": []
            },
            {
                "name": "Delete Resume",
                "request": {
                    "method": "DELETE",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/resumes/{{resumeId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "resumes", "{{resumeId}}"]
                    },
                    "description": "Delete resume"
                },
                "response": []
            },
            {
                "name": "Match Resume with Job",
                "request": {
                    "method": "POST",
                    "header": [{"key": "Content-Type", "value": "application/json"}],
                    "body": {
                        "mode": "raw",
                        "raw": json.dumps({
                            "job_id": "job-uuid-here"
                        }, indent=2)
                    },
                    "url": {
                        "raw": "{{baseUrl}}/api/resumes/{{resumeId}}/match-job",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "resumes", "{{resumeId}}", "match-job"]
                    },
                    "description": "Match resume with job posting using weighted scoring algorithm (60% skills, 20% preferred, 20% experience)"
                },
                "response": []
            }
        ]
    }

def create_contract_endpoints():
    """Create Contract folder with 6 endpoints"""
    return {
        "name": "Contracts",
        "description": "Contract management with expiration tracking and risk assessment",
        "item": [
            {
                "name": "List Contracts",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/contracts?page=1&limit=20",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "contracts"],
                        "query": [
                            {"key": "page", "value": "1"},
                            {"key": "limit", "value": "20"},
                            {"key": "contract_type", "value": "", "disabled": True},
                            {"key": "status", "value": "", "disabled": True},
                            {"key": "min_risk_score", "value": "0", "disabled": True},
                            {"key": "max_risk_score", "value": "100", "disabled": True}
                        ]
                    },
                    "description": "Get paginated list of contracts with filtering"
                },
                "response": []
            },
            {
                "name": "Get Contract",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/contracts/{{contractId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "contracts", "{{contractId}}"]
                    },
                    "description": "Get single contract by ID"
                },
                "response": []
            },
            {
                "name": "Update Contract",
                "request": {
                    "method": "PUT",
                    "header": [{"key": "Content-Type", "value": "application/json"}],
                    "body": {
                        "mode": "raw",
                        "raw": json.dumps({
                            "status": "active",
                            "risk_score": 45
                        }, indent=2)
                    },
                    "url": {
                        "raw": "{{baseUrl}}/api/contracts/{{contractId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "contracts", "{{contractId}}"]
                    },
                    "description": "Update contract fields"
                },
                "response": []
            },
            {
                "name": "Delete Contract",
                "request": {
                    "method": "DELETE",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/contracts/{{contractId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "contracts", "{{contractId}}"]
                    },
                    "description": "Delete contract"
                },
                "response": []
            },
            {
                "name": "Get Expiring Contracts",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/contracts/expiring?days=30",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "contracts", "expiring"],
                        "query": [
                            {"key": "days", "value": "30", "description": "Number of days to look ahead"}
                        ]
                    },
                    "description": "Get contracts expiring soon with days until expiration calculated"
                },
                "response": []
            },
            {
                "name": "Get High-Risk Contracts",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/contracts/high-risk?min_risk_score=70",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "contracts", "high-risk"],
                        "query": [
                            {"key": "min_risk_score", "value": "70", "description": "Minimum risk score threshold"}
                        ]
                    },
                    "description": "Get high-risk contracts above threshold"
                },
                "response": []
            }
        ]
    }

def create_receipt_endpoints():
    """Create Receipt folder with 6 endpoints"""
    return {
        "name": "Receipts",
        "description": "Receipt management with expense categorization and monthly reports",
        "item": [
            {
                "name": "List Receipts",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/receipts?page=1&limit=20",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "receipts"],
                        "query": [
                            {"key": "page", "value": "1"},
                            {"key": "limit", "value": "20"},
                            {"key": "expense_category", "value": "", "disabled": True},
                            {"key": "merchant_name", "value": "", "disabled": True},
                            {"key": "is_business_expense", "value": "true", "disabled": True},
                            {"key": "start_date", "value": "2024-01-01", "disabled": True},
                            {"key": "end_date", "value": "2024-12-31", "disabled": True}
                        ]
                    },
                    "description": "Get paginated list of receipts with filtering"
                },
                "response": []
            },
            {
                "name": "Get Receipt",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/receipts/{{receiptId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "receipts", "{{receiptId}}"]
                    },
                    "description": "Get single receipt by ID"
                },
                "response": []
            },
            {
                "name": "Update Receipt",
                "request": {
                    "method": "PUT",
                    "header": [{"key": "Content-Type", "value": "application/json"}],
                    "body": {
                        "mode": "raw",
                        "raw": json.dumps({
                            "expense_category": "food",
                            "is_business_expense": True,
                            "notes": "Team lunch"
                        }, indent=2)
                    },
                    "url": {
                        "raw": "{{baseUrl}}/api/receipts/{{receiptId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "receipts", "{{receiptId}}"]
                    },
                    "description": "Update receipt fields"
                },
                "response": []
            },
            {
                "name": "Delete Receipt",
                "request": {
                    "method": "DELETE",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/receipts/{{receiptId}}",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "receipts", "{{receiptId}}"]
                    },
                    "description": "Delete receipt"
                },
                "response": []
            },
            {
                "name": "Get Receipts by Category",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/receipts/by-category",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "receipts", "by-category"],
                        "query": [
                            {"key": "start_date", "value": "2024-01-01", "disabled": True},
                            {"key": "end_date", "value": "2024-12-31", "disabled": True},
                            {"key": "is_business_expense", "value": "true", "disabled": True}
                        ]
                    },
                    "description": "Group receipts by expense category with totals"
                },
                "response": []
            },
            {
                "name": "Get Monthly Report",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/api/receipts/monthly-report?year=2024&month=1",
                        "host": ["{{baseUrl}}"],
                        "path": ["api", "receipts", "monthly-report"],
                        "query": [
                            {"key": "year", "value": "2024", "description": "Year (required)"},
                            {"key": "month", "value": "1", "description": "Month 1-12 (required)"}
                        ]
                    },
                    "description": "Generate comprehensive monthly expense report with category and payment method breakdown"
                },
                "response": []
            }
        ]
    }

def main():
    # Read existing collection
    with open('postman/DocuFlow.postman_collection.json', 'r') as f:
        collection = json.load(f)
    
    # Add new collection variables
    new_vars = [
        {"key": "invoiceId", "value": "", "type": "string"},
        {"key": "resumeId", "value": "", "type": "string"},
        {"key": "contractId", "value": "", "type": "string"},
        {"key": "receiptId", "value": "", "type": "string"}
    ]
    
    for var in new_vars:
        if not any(v['key'] == var['key'] for v in collection['variable']):
            collection['variable'].append(var)
    
    # Find insertion point (before Health Check)
    health_check_index = next(i for i, item in enumerate(collection['item']) if item['name'] == 'Health Check')
    
    # Insert new folders
    collection['item'].insert(health_check_index, create_invoice_endpoints())
    collection['item'].insert(health_check_index + 1, create_resume_endpoints())
    collection['item'].insert(health_check_index + 2, create_contract_endpoints())
    collection['item'].insert(health_check_index + 3, create_receipt_endpoints())
    
    # Write updated collection
    with open('postman/DocuFlow.postman_collection.json', 'w') as f:
        json.dump(collection, f, indent='\t')
    
    print("✅ Postman collection updated successfully!")
    print("📝 Added 4 new folders with 22 endpoints:")
    print("   - Invoices (5 endpoints)")
    print("   - Resumes (5 endpoints)")
    print("   - Contracts (6 endpoints)")
    print("   - Receipts (6 endpoints)")

if __name__ == '__main__':
    main()
