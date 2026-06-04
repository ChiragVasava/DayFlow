// Script to update all employees with salary information
// Run this with: node updateEmployeeSalaries.js

const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/dayflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to generate random salary between 30k and 100k
const getRandomSalary = () => {
  const salaries = [30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000];
  return salaries[Math.floor(Math.random() * salaries.length)];
};

// Update employees with salary information
const updateEmployeeSalaries = async () => {
  try {
    await connectDB();

    // Find all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees to update`);

    let updatedCount = 0;

    for (const employee of employees) {
      // Skip if employee already has salaryInfo with monthlyWage
      if (employee.salaryInfo && employee.salaryInfo.monthlyWage > 0) {
        console.log(`Skipping ${employee.firstName} ${employee.lastName} - already has salary info`);
        continue;
      }

      // Use existing salary or generate random
      const monthlyWage = employee.salary && employee.salary > 0 ? employee.salary : getRandomSalary();
      const yearlyWage = monthlyWage * 12;

      // Calculate basic salary (50% of monthly wage)
      const basicSalary = monthlyWage * 0.50;

      // Update employee with complete salary information
      employee.salary = monthlyWage;
      employee.salaryInfo = {
        monthlyWage: monthlyWage,
        yearlyWage: yearlyWage,
        workingDaysPerWeek: 5,
        breakTimeHours: 1,
        components: {
          basicSalary: {
            value: basicSalary,
            percentage: 50
          },
          houseRentAllowance: {
            value: basicSalary * 0.50, // 50% of basic
            percentage: 50
          },
          standardAllowance: {
            value: monthlyWage * 0.1667,
            percentage: 16.67
          },
          performanceBonus: {
            value: monthlyWage * 0.0633,
            percentage: 6.33
          },
          leaveTravelAllowance: {
            value: monthlyWage * 0.0633,
            percentage: 6.33
          },
          fixedAllowance: {
            value: monthlyWage * 0.1167,
            percentage: 11.67
          }
        },
        providentFund: {
          employeeContribution: {
            value: basicSalary * 0.12,
            percentage: 12
          },
          employerContribution: {
            value: basicSalary * 0.12,
            percentage: 12
          }
        },
        taxDeductions: {
          professionalTax: 200,
          incomeTax: {
            value: 0,
            percentage: 0
          }
        }
      };

      await employee.save();
      updatedCount++;
      console.log(`✓ Updated ${employee.firstName} ${employee.lastName} - Monthly: ₹${monthlyWage}, Yearly: ₹${yearlyWage}`);
    }

    console.log(`\n✅ Successfully updated ${updatedCount} employees with salary information`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating employees:', error);
    process.exit(1);
  }
};

// Run the update
updateEmployeeSalaries();
