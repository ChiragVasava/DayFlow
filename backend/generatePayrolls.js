const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Payroll = require('./models/Payroll');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dayflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const generatePayrollRecords = async () => {
  try {
    console.log('Fetching employees...');
    const employees = await Employee.find({});
    
    if (employees.length === 0) {
      console.log('No employees found in database');
      process.exit(0);
    }

    console.log(`Found ${employees.length} employees`);

    // Generate payroll for the last 6 months
    const currentDate = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear()
      });
    }

    console.log(`Generating payroll records for ${months.length} months...`);

    for (const employee of employees) {
      // Skip if employee doesn't have salary info
      if (!employee.salaryInfo || !employee.salaryInfo.monthlyWage) {
        console.log(`Skipping ${employee.name} - no salary info`);
        continue;
      }

      for (const period of months) {
        // Check if payroll already exists
        const existing = await Payroll.findOne({
          employee: employee._id,
          month: period.month,
          year: period.year
        });

        if (existing) {
          console.log(`Payroll already exists for ${employee.name} - ${period.month}/${period.year}`);
          continue;
        }

        // Extract allowances from employee salary info
        const hra = employee.salaryInfo.allowances?.find(a => a.type === 'HRA')?.amount || 0;
        const transport = employee.salaryInfo.allowances?.find(a => a.type === 'Transport')?.amount || 0;
        const medical = employee.salaryInfo.allowances?.find(a => a.type === 'Medical')?.amount || 0;

        // Extract deductions from employee salary info
        const tax = employee.salaryInfo.deductions?.find(d => d.type === 'Tax')?.amount || 0;
        const providentFund = employee.salaryInfo.deductions?.find(d => d.type === 'PF')?.amount || 0;
        const insurance = employee.salaryInfo.deductions?.find(d => d.type === 'Insurance')?.amount || 0;

        // Determine payment status - last 2 months are Paid, current month is Pending
        let paymentStatus = 'Paid';
        let paymentDate = new Date(period.year, period.month - 1, 28); // Pay on 28th

        const monthsAgo = (currentDate.getFullYear() - period.year) * 12 + 
                         (currentDate.getMonth() + 1 - period.month);
        
        if (monthsAgo === 0) {
          paymentStatus = 'Pending';
          paymentDate = null;
        } else if (monthsAgo === 1) {
          paymentStatus = 'Processed';
        }

        // Add occasional bonuses (10% chance)
        const bonuses = Math.random() > 0.9 ? Math.floor(employee.salaryInfo.monthlyWage * 0.1) : 0;

        const payrollData = {
          employee: employee._id,
          month: period.month,
          year: period.year,
          basicSalary: employee.salaryInfo.monthlyWage,
          allowances: {
            hra,
            transport,
            medical,
            other: 0
          },
          deductions: {
            tax,
            providentFund,
            insurance,
            other: 0
          },
          bonuses,
          paymentStatus,
          paymentDate,
          createdBy: employee._id // Using employee ID as creator for demo
        };

        // Create payroll record
        const payroll = new Payroll(payrollData);
        await payroll.save();

        console.log(`✓ Created payroll for ${employee.name} - ${getMonthName(period.month)} ${period.year} - Net: ₹${payroll.netSalary.toLocaleString('en-IN')}`);
      }
    }

    console.log('\n✓ Payroll generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating payroll:', error);
    process.exit(1);
  }
};

function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

// Run the script
generatePayrollRecords();
