const axios = require('axios');

async function testSubmit() {
  try {
    // Login first
    console.log('1. Logging in as contributor1...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'contributor1',
      password: 'password123'
    });
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token);
    
    // Submit fee data
    console.log('\n2. Submitting fee data with all 16 fields...');
    const feeData = {
      submitterName: 'Test Submitter',
      submitterDivision: 'Test Division',
      submitterInputDate: '2024-02-16',
      serviceProvider: 'PT Test Provider',
      serviceRecipient: 'PT Test Recipient',
      serviceType: 'Test Service Type',
      scopeOfWork: 'Test scope of work description',
      taxYear: '2024',
      financialType: 'Test Financial Type',
      financialDescription: 'Test financial description',
      feeScheme: 'Fixed Fee',
      feeAmount: '50000000',
      currency: 'IDR',
      financialDate: '2024-02-16'
    };
    
    const submitResponse = await axios.post('http://localhost:3000/api/fee-data', feeData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Submit successful');
    console.log('\n3. Submitted data:');
    console.log(JSON.stringify(submitResponse.data, null, 2));
    
    // Fetch the data back
    console.log('\n4. Fetching data back from /api/my-data...');
    const myDataResponse = await axios.get('http://localhost:3000/api/my-data', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const latestData = myDataResponse.data.feeData[0];
    console.log('\n5. Latest data from database:');
    console.log('submitter_name:', latestData.submitter_name);
    console.log('submitter_division:', latestData.submitter_division);
    console.log('service_provider:', latestData.service_provider);
    console.log('service_recipient:', latestData.service_recipient);
    console.log('service_type:', latestData.service_type);
    console.log('tax_year:', latestData.tax_year);
    console.log('financial_type:', latestData.financial_type);
    console.log('fee_scheme:', latestData.fee_scheme);
    console.log('fee_amount:', latestData.fee_amount);
    
    // Check for null values
    const nullFields = [];
    Object.keys(latestData).forEach(key => {
      if (latestData[key] === null) {
        nullFields.push(key);
      }
    });
    
    if (nullFields.length > 0) {
      console.log('\n❌ NULL FIELDS FOUND:', nullFields);
    } else {
      console.log('\n✅ All fields have values!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSubmit();
