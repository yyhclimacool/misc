# 帮我用 Python 写一个程序，用来计算个人年度税后收入和公司的用人成本，年度税后总收入=年度应纳税额*税率-速算扣除数，年度应纳税额=月薪*总月数（比如 15 薪，就是 15 个月） - 基本减除费用（每年60,000元）- 专项扣除 - 专项附加扣除，其中专项扣除需要结合公司给员工缴纳社保和公积金的政策来计算，举例来说，月薪 5 万（显然这是程序的一个参数），杭州的社保缴纳基数为 4812 元（公司按照最低标准交，这也应该是程序的一个参数），养老保险:单位14%，个人8%，医疗保险:单位9.5% (含生育保险0.6%)，个人2%，失业保险:单位0.5%，个人0.5%，工伤保险:单位0.2%-1.5%（根据行业风险等级浮动），个人不缴费。公积金缴纳基数为 30000 元（公司按照 30000 元的标准缴纳），个人和公司分别缴纳 12%。专项附加扣除作为一个参数即可（不需要考虑具体的扣除项）。程序的输出需要很详细的各项扣除费用，全年的应纳税额，全年的税率和缴税金额。

# 用户填写参数
monthly_salary = 30000
annual_months = 13
# social_insurance_base = 24930
social_insurance_base = 4812
# housing_fund_base = 39530
housing_fund_base = 30000
special_deduction = 0

def calculate_tax_and_cost():
    # 社保公积金缴纳比例（根据杭州政策示例）
    # 个人缴纳比例
    pension_ins_rate_personal = 0.08      # 养老保险个人比例
    medical_ins_rate_personal = 0.02      # 医疗保险个人比例
    unemployment_ins_rate_personal = 0.005 # 失业保险个人比例
    housing_fund_rate_personal = 0.12      # 公积金个人比例
    
    # 公司缴纳比例
    pension_ins_rate_company = 0.14      # 养老保险单位比例
    medical_ins_rate_company = 0.095     # 医疗保险单位比例
    unemployment_ins_rate_company = 0.005 # 失业保险单位比例
    injury_ins_rate_company = 0.002      # 工伤保险单位比例
    housing_fund_rate_company = 0.12     # 公积金单位比例

    # 1. 计算个人每月专项扣除（社保公积金个人部分）
    monthly_pension_personal = social_insurance_base * pension_ins_rate_personal
    monthly_medical_personal = social_insurance_base * medical_ins_rate_personal
    monthly_unemployment_personal = social_insurance_base * unemployment_ins_rate_personal
    monthly_housing_fund_personal = housing_fund_base * housing_fund_rate_personal
    
    monthly_social_insurance_personal = (monthly_pension_personal + 
                                        monthly_medical_personal + 
                                        monthly_unemployment_personal)
    
    monthly_total_deduction_personal = monthly_social_insurance_personal + monthly_housing_fund_personal
    annual_total_deduction_personal = monthly_total_deduction_personal * 12

    # 2. 计算全年收入
    annual_income = monthly_salary * annual_months

    # 3. 计算全年应纳税所得额
    basic_deduction = 60000  # 基本减除费用
    taxable_income = annual_income - basic_deduction - annual_total_deduction_personal - special_deduction
    
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
        (float('inf'), 0.45, 181920)
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
    
    monthly_social_insurance_company = (monthly_pension_company + 
                                       monthly_medical_company + 
                                       monthly_unemployment_company + 
                                       monthly_injury_company)
    
    monthly_company_cost =  monthly_social_insurance_company + monthly_housing_fund_company
    annual_company_cost = monthly_company_cost * 12 + annual_income

    # 输出详细结果
    print("\n" + "="*25 + " 年度收入与扣除明细 " + "="*25)
    print(f"税前年收入: {annual_income:.2f}元 = {monthly_salary:.2f}元 × {annual_months}个月")
    print(f"基本减除费用: {basic_deduction:.2f}元")
    print(f"专项附加扣除: {special_deduction:.2f}元")
    
    print("\n" + "="*25 + " 个人社保公积金缴纳明细 " + "="*25)
    print(f"养老保险个人部分: {monthly_pension_personal:.2f}元/月 × 12 = {monthly_pension_personal*12:.2f}元/年")
    print(f"医疗保险个人部分: {monthly_medical_personal:.2f}元/月 × 12 = {monthly_medical_personal*12:.2f}元/年")
    print(f"失业保险个人部分: {monthly_unemployment_personal:.2f}元/月 × 12 = {monthly_unemployment_personal*12:.2f}元/年")
    print(f"住房公积金个人部分: {monthly_housing_fund_personal:.2f}元/月 × 12 = {monthly_housing_fund_personal*12:.2f}元/年")
    print(f"个人专项扣除总额: {annual_total_deduction_personal:.2f}元/年")
    
    print("\n【税务计算】")
    print(f"应纳税所得额: {taxable_income:.2f}元 = （{annual_income:.2f}元 - {basic_deduction:.2f}元 - {annual_total_deduction_personal:.2f}元 - {special_deduction:.2f}元）")
    print(f"适用税率: {applied_rate*100:.0f}%")
    print(f"速算扣除数: {deduction_amount:.2f}元")
    print(f"年度个人所得税: {annual_tax:.2f}元")
    
    print(f"\n【个人总收益】")
    print(f"税后年收入: {after_tax_income:.2f}元 = （{annual_income:.2f}元 - {annual_total_deduction_personal:.2f}元 - {annual_tax:.2f}元）")
    print(f"每月税后收入参考: {after_tax_income/12:.2f}元")
    print(f"\n社保总收益: {monthly_social_insurance_personal*12+monthly_social_insurance_company*12:.2f}元/年 = ({monthly_social_insurance_personal:.2f}*12 + {monthly_social_insurance_company:.2f}*12)")
    print(f"\t 养老保险: {monthly_pension_personal*12+monthly_pension_company*12:.2f}元/年 = ({monthly_pension_personal:.2f}*12 + {monthly_pension_company:.2f}*12)")
    print(f"\t 医疗保险: {monthly_medical_personal*12+monthly_medical_company*12:.2f}元/年 = ({monthly_medical_personal:.2f}*12 + {monthly_medical_company:.2f}*12)")
    print(f"\t 失业保险: {monthly_unemployment_personal*12+monthly_unemployment_company*12:.2f}元/年 = ({monthly_unemployment_personal:.2f}*12 + {monthly_unemployment_company:.2f}*12)")
    print(f"住房公积金: {monthly_housing_fund_personal*12+monthly_housing_fund_company*12:.2f}元/年 = ({monthly_housing_fund_personal:.2f}*12 + {monthly_housing_fund_company:.2f}*12)")
    print(f"税后现金总收益: {after_tax_income+monthly_housing_fund_personal*12+monthly_housing_fund_company*12:.2f}元 = {after_tax_income:.2f}元 + {monthly_housing_fund_personal*12+monthly_housing_fund_company*12:.2f}元")
    
    print("\n" + "="*25 + " 公司用人成本明细 " + "="*25)
    print(f"公司社保承担部分: {monthly_social_insurance_company:.2f}元/月 × 12 = {monthly_social_insurance_company*12:.2f}元/年")
    print(f"公司公积金承担部分: {monthly_housing_fund_company:.2f}元/月 × 12 = {monthly_housing_fund_company*12:.2f}元/年")
    print(f"年度总用人成本: {annual_company_cost:.2f}元 = {monthly_company_cost:.2f}元/月 × 12 + {annual_income:.2f}元")
    print(f"每月平均用人成本: {annual_company_cost/12:.2f}元 = {annual_company_cost:.2f}元 / 12")
    print("\n")

# 运行程序
if __name__ == "__main__":
    calculate_tax_and_cost()