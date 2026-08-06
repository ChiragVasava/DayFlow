You're very welcome! I'm thrilled to hear that the Vercel and Render deployments are now fully synced and working.

Here is a step-by-step test script to walk through and experience all the features of DayFlow (Admin/HR controls, Employee attendance/leaves, and the automatic payroll loop).

---

### Step 1: Admin & HR Operations
First, log in as the **Admin** using:
* **Employee ID**: `OIADMN20230001`
* **Password**: `admin123`

#### 📋 Action Items:
1. **Explore the Admin Dashboard**:
   * Observe the live widgets (total employees count, attendance rates, pending leaves).
2. **Add a New Employee (Your Test User)**:
   * Go to **Employees** -> **Add Employee** (or **Create Employee**).
   * Fill out the form: Name, Email (e.g. `test@dayflow.com`), Department (e.g. `Engineering`), Designation, and Salary (e.g. `50000`).
   * Enter a password you can remember (e.g. `testpassword`).
   * **Click Save** and make sure to **write down/copy the generated Employee ID** (Format: `OIJODOXXXXXXXX`).
3. **Upload Profile Photo / Documents**:
   * Search for your new employee in the **Employee List**.
   * Click their profile and test uploading a profile picture, updating bank details, or editing their information.

---

### Step 2: Employee Daily Actions
Log out of the Admin account, and log in with your **newly created Employee ID** and the password you set.

#### 📋 Action Items:
1. **Simulate Attendance Check-In**:
   * On your dashboard, click **Check In**.
   * The system logs your check-in time and GPS/network status, updating your status to "Checked In".
   * Refresh the page or click **Check Out** later to log your end-of-day attendance. 
   * Navigate to the **My Attendance** page to see your calendar list of check-in records.
2. **Submit a Leave Request**:
   * Go to the **Leaves** tab.
   * Click **Apply for Leave**.
   * Choose a leave type (e.g., Casual, Paid, or Sick), select dates (e.g., tomorrow), enter a reason (e.g., "Family event"), and click **Submit**.
   * Your leave status will now show as `Pending`.

---

### Step 3: Admin Review & Payroll Processing
Log out of the Employee account, and log back in as the **Admin** (`OIADMN20230001` / `admin123`).

#### 📋 Action Items:
1. **Approve the Leave Request**:
   * Go to the **Leaves** page.
   * Under **Leave Requests**, you will see the pending leave request from your test employee.
   * Click **Approve** (or Reject to test both flows).
2. **Generate Monthly Payroll**:
   * Go to the **Payroll** page.
   * Click **Generate Payslip** or select the test employee for the current month and year.
   * The backend dynamically computes their net salary based on the monthly attendance rates, approved leaves, and base salary.
   * Click **Generate** to save the payslip.
   * Click **View/Print** to see the interactive HTML/PDF payslip layout.

---

### Step 4: Employee Final Check
Log back out of the Admin, and log back in as the **test Employee**.

#### 📋 Action Items:
1. Check the **Leaves** tab: You will see your leave request status updated to `Approved`.
2. Check the **My Payroll** tab: Your generated payslip is now visible. You can open and download it.