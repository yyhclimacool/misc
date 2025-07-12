// 主要JavaScript逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取表单和结果元素
    const form = document.getElementById('taxForm');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    
    // 表单提交事件
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 显示加载状态
        showLoading();
        
        // 获取表单数据
        const formData = {
            monthly_salary: parseFloat(document.getElementById('monthly_salary').value),
            annual_months: parseInt(document.getElementById('annual_months').value),
            social_insurance_base: parseFloat(document.getElementById('social_insurance_base').value),
            housing_fund_base: parseFloat(document.getElementById('housing_fund_base').value),
            special_deduction: parseFloat(document.getElementById('special_deduction').value)
        };
        
        try {
            // 发送API请求
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                displayResults(result.data);
            } else {
                showError(result.error);
            }
        } catch (err) {
            showError('网络错误，请稍后重试');
        }
    });
    
    // 显示加载状态
    function showLoading() {
        loading.classList.remove('d-none');
        results.classList.add('d-none');
        error.classList.add('d-none');
    }
    
    // 显示错误信息
    function showError(message) {
        loading.classList.add('d-none');
        results.classList.add('d-none');
        error.classList.remove('d-none');
        document.getElementById('error-message').textContent = message;
    }
    
    // 显示计算结果
    function displayResults(data) {
        loading.classList.add('d-none');
        error.classList.add('d-none');
        results.classList.remove('d-none');
        
        // 核心结果卡片
        document.getElementById('after_tax_income').textContent = formatCurrency(data.final_results.after_tax_income);
        document.getElementById('monthly_after_tax').textContent = `月均: ${formatCurrency(data.final_results.monthly_after_tax)}`;
        document.getElementById('annual_company_cost').textContent = formatCurrency(data.final_results.annual_company_cost);
        document.getElementById('monthly_company_cost').textContent = `月均: ${formatCurrency(data.final_results.monthly_company_cost)}`;
        
        // 个人收益明细
        document.getElementById('annual_income').textContent = formatCurrency(data.annual_income);
        document.getElementById('basic_deduction').textContent = formatCurrency(data.basic_deduction);
        document.getElementById('special_deduction_display').textContent = formatCurrency(data.special_deduction);
        document.getElementById('personal_annual_total').textContent = formatCurrency(data.personal_insurance.annual_total);
        document.getElementById('annual_tax').textContent = formatCurrency(data.tax_calculation.annual_tax);
        document.getElementById('after_tax_display').textContent = formatCurrency(data.final_results.after_tax_income);
        
        // 个人社保公积金明细
        document.getElementById('personal_pension').textContent = formatCurrency(data.personal_insurance.monthly_pension * 12);
        document.getElementById('personal_medical').textContent = formatCurrency(data.personal_insurance.monthly_medical * 12);
        document.getElementById('personal_unemployment').textContent = formatCurrency(data.personal_insurance.monthly_unemployment * 12);
        document.getElementById('personal_housing_fund').textContent = formatCurrency(data.personal_insurance.monthly_housing_fund * 12);
        document.getElementById('personal_total_display').textContent = formatCurrency(data.personal_insurance.annual_total);
        
        // 公司成本明细
        document.getElementById('company_salary').textContent = formatCurrency(data.annual_income);
        document.getElementById('company_social_insurance').textContent = formatCurrency(data.company_insurance.annual_total - data.company_insurance.monthly_housing_fund * 12);
        document.getElementById('company_housing_fund').textContent = formatCurrency(data.company_insurance.monthly_housing_fund * 12);
        document.getElementById('company_total_cost').textContent = formatCurrency(data.final_results.annual_company_cost);
        
        // 公司社保公积金明细
        document.getElementById('company_pension').textContent = formatCurrency(data.company_insurance.monthly_pension * 12);
        document.getElementById('company_medical').textContent = formatCurrency(data.company_insurance.monthly_medical * 12);
        document.getElementById('company_unemployment').textContent = formatCurrency(data.company_insurance.monthly_unemployment * 12);
        document.getElementById('company_injury').textContent = formatCurrency(data.company_insurance.monthly_injury * 12);
        document.getElementById('company_housing_fund_detail').textContent = formatCurrency(data.company_insurance.monthly_housing_fund * 12);
        document.getElementById('company_total_insurance').textContent = formatCurrency(data.company_insurance.annual_total);
        
        // 税务计算明细
        document.getElementById('taxable_income').textContent = formatCurrency(data.tax_calculation.taxable_income);
        document.getElementById('tax_rate').textContent = `${(data.tax_calculation.applied_rate * 100).toFixed(0)}%`;
        document.getElementById('quick_deduction').textContent = formatCurrency(data.tax_calculation.deduction_amount);
        document.getElementById('tax_amount').textContent = formatCurrency(data.tax_calculation.annual_tax);
        
        // 总收益分析
        document.getElementById('cash_benefit').textContent = formatCurrency(data.final_results.after_tax_income);
        document.getElementById('housing_fund_benefit').textContent = formatCurrency(data.final_results.total_housing_fund);
        document.getElementById('total_benefit').textContent = formatCurrency(data.final_results.total_cash_benefit);
        
        // 添加动画效果
        addAnimationToNumbers();
    }
    
    // 格式化货币
    function formatCurrency(amount) {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    // 添加数字动画效果
    function addAnimationToNumbers() {
        const numberElements = document.querySelectorAll('#results [id*="income"], #results [id*="cost"], #results [id*="tax"], #results [id*="total"], #results [id*="benefit"]');
        numberElements.forEach(element => {
            element.classList.add('number-animate');
        });
    }
    
    // 输入验证
    function validateForm() {
        const inputs = form.querySelectorAll('input[type="number"]');
        let isValid = true;
        
        inputs.forEach(input => {
            const value = parseFloat(input.value);
            if (isNaN(value) || value < 0) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });
        
        return isValid;
    }
    
    // 实时输入验证
    form.addEventListener('input', function(e) {
        if (e.target.type === 'number') {
            const value = parseFloat(e.target.value);
            if (isNaN(value) || value < 0) {
                e.target.classList.add('is-invalid');
                e.target.classList.remove('is-valid');
            } else {
                e.target.classList.remove('is-invalid');
                e.target.classList.add('is-valid');
            }
        }
    });
    
    // 页面加载时自动计算一次
    form.dispatchEvent(new Event('submit'));
    
    // 工具提示初始化
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // 打印功能
    window.printResults = function() {
        if (results.classList.contains('d-none')) {
            alert('请先计算结果后再打印');
            return;
        }
        window.print();
    };
    
    // 导出功能
    window.exportResults = function() {
        if (results.classList.contains('d-none')) {
            alert('请先计算结果后再导出');
            return;
        }
        
        // 获取当前计算结果
        const resultData = {
            monthly_salary: document.getElementById('monthly_salary').value,
            annual_months: document.getElementById('annual_months').value,
            social_insurance_base: document.getElementById('social_insurance_base').value,
            housing_fund_base: document.getElementById('housing_fund_base').value,
            special_deduction: document.getElementById('special_deduction').value,
            after_tax_income: document.getElementById('after_tax_income').textContent,
            annual_company_cost: document.getElementById('annual_company_cost').textContent
        };
        
        // 创建CSV内容
        const csvContent = "data:text/csv;charset=utf-8," + 
            "项目,数值\n" +
            "月薪," + resultData.monthly_salary + "\n" +
            "年薪月数," + resultData.annual_months + "\n" +
            "社保基数," + resultData.social_insurance_base + "\n" +
            "公积金基数," + resultData.housing_fund_base + "\n" +
            "专项附加扣除," + resultData.special_deduction + "\n" +
            "税后年收入," + resultData.after_tax_income + "\n" +
            "公司用人成本," + resultData.annual_company_cost;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "税务计算结果.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });
}); 