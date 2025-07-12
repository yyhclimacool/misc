from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)


def calculate_tax_and_cost(
    monthly_salary,
    annual_months,
    social_insurance_base,
    housing_fund_base,
    special_deduction,
):
    """
    计算个人所得税和公司用人成本
    """
    # 社保公积金缴纳比例（根据杭州政策示例）
    # 个人缴纳比例
    pension_ins_rate_personal = 0.08  # 养老保险个人比例
    medical_ins_rate_personal = 0.02  # 医疗保险个人比例
    unemployment_ins_rate_personal = 0.005  # 失业保险个人比例
    housing_fund_rate_personal = 0.12  # 公积金个人比例

    # 公司缴纳比例
    pension_ins_rate_company = 0.14  # 养老保险单位比例
    medical_ins_rate_company = 0.095  # 医疗保险单位比例
    unemployment_ins_rate_company = 0.005  # 失业保险单位比例
    injury_ins_rate_company = 0.002  # 工伤保险单位比例
    housing_fund_rate_company = 0.12  # 公积金单位比例

    # 1. 计算个人每月专项扣除（社保公积金个人部分）
    monthly_pension_personal = social_insurance_base * pension_ins_rate_personal
    monthly_medical_personal = social_insurance_base * medical_ins_rate_personal
    monthly_unemployment_personal = (
        social_insurance_base * unemployment_ins_rate_personal
    )
    monthly_housing_fund_personal = housing_fund_base * housing_fund_rate_personal

    monthly_social_insurance_personal = (
        monthly_pension_personal
        + monthly_medical_personal
        + monthly_unemployment_personal
    )

    monthly_total_deduction_personal = (
        monthly_social_insurance_personal + monthly_housing_fund_personal
    )
    annual_total_deduction_personal = monthly_total_deduction_personal * 12

    # 2. 计算全年收入
    annual_income = monthly_salary * annual_months

    # 3. 计算全年应纳税所得额
    basic_deduction = 60000  # 基本减除费用
    taxable_income = (
        annual_income
        - basic_deduction
        - annual_total_deduction_personal
        - special_deduction
    )

    # 确保应纳税所得额不为负数
    taxable_income = max(0, taxable_income)

    # 4. 计算全年个人所得税（使用超额累进税率）
    tax_brackets = [
        (36000, 0.03, 0),
        (144000, 0.10, 2520),
        (300000, 0.20, 16920),
        (420000, 0.25, 31920),
        (660000, 0.30, 52920),
        (960000, 0.35, 85920),
        (float("inf"), 0.45, 181920),
    ]

    annual_tax = 0
    applied_rate = 0
    deduction_amount = 0

    # 正确方法：直接对整个应纳税所得额应用对应税率和速算扣除数
    for threshold, rate, deduction in tax_brackets:
        if taxable_income <= threshold:
            annual_tax = taxable_income * rate - deduction
            applied_rate = rate
            deduction_amount = deduction
            break

    # 5. 计算税后收入
    after_tax_income = annual_income - annual_total_deduction_personal - annual_tax

    # 6. 计算公司用人成本
    # 公司每月承担部分
    monthly_pension_company = social_insurance_base * pension_ins_rate_company
    monthly_medical_company = social_insurance_base * medical_ins_rate_company
    monthly_unemployment_company = social_insurance_base * unemployment_ins_rate_company
    monthly_injury_company = social_insurance_base * injury_ins_rate_company
    monthly_housing_fund_company = housing_fund_base * housing_fund_rate_company

    monthly_social_insurance_company = (
        monthly_pension_company
        + monthly_medical_company
        + monthly_unemployment_company
        + monthly_injury_company
    )

    monthly_company_cost = (
        monthly_social_insurance_company + monthly_housing_fund_company
    )
    annual_company_cost = monthly_company_cost * 12 + annual_income

    # 返回详细结果
    return {
        "annual_income": annual_income,
        "basic_deduction": basic_deduction,
        "special_deduction": special_deduction,
        "personal_insurance": {
            "monthly_pension": monthly_pension_personal,
            "monthly_medical": monthly_medical_personal,
            "monthly_unemployment": monthly_unemployment_personal,
            "monthly_housing_fund": monthly_housing_fund_personal,
            "monthly_total": monthly_total_deduction_personal,
            "annual_total": annual_total_deduction_personal,
        },
        "company_insurance": {
            "monthly_pension": monthly_pension_company,
            "monthly_medical": monthly_medical_company,
            "monthly_unemployment": monthly_unemployment_company,
            "monthly_injury": monthly_injury_company,
            "monthly_housing_fund": monthly_housing_fund_company,
            "monthly_total": monthly_company_cost,
            "annual_total": monthly_company_cost * 12,
        },
        "tax_calculation": {
            "taxable_income": taxable_income,
            "applied_rate": applied_rate,
            "deduction_amount": deduction_amount,
            "annual_tax": annual_tax,
        },
        "final_results": {
            "after_tax_income": after_tax_income,
            "monthly_after_tax": after_tax_income / 12,
            "annual_company_cost": annual_company_cost,
            "monthly_company_cost": annual_company_cost / 12,
            "total_social_insurance": monthly_social_insurance_personal * 12
            + monthly_social_insurance_company * 12,
            "total_housing_fund": monthly_housing_fund_personal * 12
            + monthly_housing_fund_company * 12,
            "total_cash_benefit": after_tax_income
            + monthly_housing_fund_personal * 12
            + monthly_housing_fund_company * 12,
        },
    }


@app.route("/")
def index():
    """首页"""
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def api_calculate():
    """计算API"""
    try:
        data = request.json
        monthly_salary = float(data.get("monthly_salary", 30000))
        annual_months = int(data.get("annual_months", 13))
        social_insurance_base = float(data.get("social_insurance_base", 4812))
        housing_fund_base = float(data.get("housing_fund_base", 30000))
        special_deduction = float(data.get("special_deduction", 0))

        result = calculate_tax_and_cost(
            monthly_salary,
            annual_months,
            social_insurance_base,
            housing_fund_base,
            special_deduction,
        )

        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
