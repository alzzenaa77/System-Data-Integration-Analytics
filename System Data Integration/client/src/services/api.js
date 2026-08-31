import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const DEMO_MODE = true; // Temporarily set to true to bypass backend issues

// Mock data for demo mode
const MOCK_DATA = {
  feeData: [],
  crossDivisionData: [],
  points: {
    totalPoints: 0,
    redeemableMultiples: 0,
    canRedeem: false,
    history: []
  },
  notifications: [],
  pointTransactions: [],
  clarifications: {} // Store clarifications by data ID
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API wrapper that handles both demo and real mode
const api = {
  get: async (endpoint) => {
    if (DEMO_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Return mock data based on endpoint
      if (endpoint.includes('/my-data')) {
        const userId = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).id : '1';

        // Sort by ID descending (newest first) to maintain consistent order
        const userFeeData = MOCK_DATA.feeData
          .filter(d => d.contributor_id === userId)
          .sort((a, b) => b.id - a.id);

        const userCrossData = MOCK_DATA.crossDivisionData
          .filter(d => d.contributor_id === userId)
          .sort((a, b) => b.id - a.id);

        return {
          data: {
            feeData: userFeeData,
            crossDivisionData: userCrossData
          }
        };
      } else if (endpoint.includes('/my-points')) {
        const userId = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).id : '1';
        const userPoints = MOCK_DATA.points[userId] || { totalPoints: 0, history: [] };
        return {
          data: {
            totalPoints: userPoints.totalPoints,
            redeemableMultiples: Math.floor(userPoints.totalPoints / 5),
            canRedeem: userPoints.totalPoints >= 5,
            history: userPoints.history || []
          }
        };
      } else if (endpoint.includes('/notifications')) {
        const userId = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).id : '1';
        const userRole = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).role : 'CONTRIBUTOR';

        // Filter notifications for this user
        const userNotifications = MOCK_DATA.notifications.filter(n =>
          n.recipient_role === userRole || n.recipient_id === userId
        );

        return { data: userNotifications };
      } else if (endpoint.includes('/point-redemptions')) {
        // Return all point redemptions for validators
        const redemptions = MOCK_DATA.notifications
          .filter(n => n.type === 'POINT_REDEMPTION')
          .map(n => {
            const data = JSON.parse(n.data);
            return {
              id: n.id,
              contributor_id: data.contributor_id,
              contributor_name: data.contributor_name,
              points: data.points,
              reward_given: data.reward_given || false,
              reward_given_at: data.reward_given_at || null,
              created_at: n.created_at
            };
          });
        return { data: redemptions };
      } else if (endpoint.includes('/my-redemptions')) {
        // Return redemptions for the current contributor
        const userId = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).id : '1';
        const redemptions = MOCK_DATA.notifications
          .filter(n => n.type === 'POINT_REDEMPTION')
          .map(n => {
            const nData = JSON.parse(n.data);
            return {
              id: n.id,
              contributor_id: nData.contributor_id,
              contributor_name: nData.contributor_name,
              points: nData.points,
              reward_given: nData.reward_given || false,
              reward_given_at: nData.reward_given_at || null,
              created_at: n.created_at
            };
          })
          .filter(r => r.contributor_id === userId);
        return { data: redemptions };
      } else if (endpoint.includes('/validations/pending')) {
        return {
          data: {
            feeData: MOCK_DATA.feeData.filter(d => d.status === 'PENDING'),
            crossDivisionData: MOCK_DATA.crossDivisionData.filter(d => d.status === 'PENDING')
          }
        };
      } else if (endpoint.includes('/dashboard/fee-competitor')) {
        return { data: MOCK_DATA.feeData.filter(d => d.status === 'ACCEPTED') };
      } else if (endpoint.includes('/dashboard/cross-division')) {
        // Show all cross-division data grouped by division (not just ACCEPTED)
        return { data: MOCK_DATA.crossDivisionData };
      } else if (endpoint.includes('/audit-report')) {
        // Audit report: return all fee_data + cross_division_data for analysis
        return {
          data: {
            feeData: MOCK_DATA.feeData,
            crossData: MOCK_DATA.crossDivisionData
          }
        };
      }
      return { data: [] };
    }

    return axios.get(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders()
    });
  },

  post: async (endpoint, data, config = {}) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Simulate successful submission
      // NOTE: Check /clarification FIRST before generic /fee-data or /cross-division-data
      if (endpoint.includes('/clarification')) {
        // Handle clarification submission for both fee-data and cross-division-data
        const parts = endpoint.split('/');
        const dataId = parseInt(parts[2]);
        const dataType = parts[1]; // 'fee-data' or 'cross-division-data'

        console.log('=== CLARIFICATION DEBUG ===');
        console.log('Data ID:', dataId, 'Data Type:', dataType);

        if (dataType === 'fee-data') {
          const item = MOCK_DATA.feeData.find(d => d.id === dataId);
          console.log('Found fee-data item:', item);
          if (item) {
            item.status = 'PENDING';
            item.clarification_submitted = true;
            item.clarification_text = data.clarification;
            item.clarification_submitted_at = new Date().toISOString();
            console.log('Updated: status=PENDING, clarification_submitted=true');
          } else {
            console.error('ERROR: Fee-data item not found with ID:', dataId);
          }
        } else {
          const item = MOCK_DATA.crossDivisionData.find(d => d.id === dataId);
          console.log('Found cross-division item:', item);
          if (item) {
            item.status = 'PENDING';
            item.clarification_submitted = true;
            item.clarification_text = data.clarification;
            item.clarification_submitted_at = new Date().toISOString();
            console.log('Updated: status=PENDING, clarification_submitted=true');
          } else {
            console.error('ERROR: Cross-division item not found with ID:', dataId);
          }
        }
        console.log('=== END CLARIFICATION DEBUG ===');
        return { data: { success: true, message: 'Clarification submitted, waiting for validator approval' } };

      } else if (endpoint.includes('/fee-data')) {
        if (endpoint.includes('/validate')) {
          // Handle validation
          const id = parseInt(endpoint.split('/')[2]);
          console.log('=== VALIDATE DEBUG ===');
          console.log('Validating ID:', id);
          console.log('Decision:', data.decision);
          console.log('Before - Total feeData:', MOCK_DATA.feeData.length);

          const item = MOCK_DATA.feeData.find(v => v.id === id);
          console.log('Found item:', item);

          if (item) {
            const oldStatus = item.status;
            item.status = data.decision === 'ACCEPT' ? 'ACCEPTED' : data.decision === 'REJECT' ? 'REJECTED' : 'NEEDS_CLARIFICATION';
            // Reset clarification_submitted when validator requests new clarification
            if (data.decision !== 'ACCEPT' && data.decision !== 'REJECT') {
              item.clarification_submitted = false;
            }
            console.log('Status changed from', oldStatus, 'to', item.status);

            // If accepted, add points to contributor
            if (data.decision === 'ACCEPT' && oldStatus !== 'ACCEPTED') {
              const contributorId = item.contributor_id;

              // Add 5 points
              if (!MOCK_DATA.pointTransactions[contributorId]) {
                MOCK_DATA.pointTransactions[contributorId] = [];
              }

              MOCK_DATA.pointTransactions[contributorId].push({
                id: Date.now(),
                contributor_id: contributorId,
                points: 5,
                transaction_type: 'EARN',
                description: `Fee data approved: ${item.service_type}`,
                created_at: new Date().toISOString()
              });

              // Update points history
              if (!MOCK_DATA.points[contributorId]) {
                MOCK_DATA.points[contributorId] = {
                  totalPoints: 0,
                  history: []
                };
              }

              MOCK_DATA.points[contributorId].totalPoints += 5;
              MOCK_DATA.points[contributorId].history.push({
                points: 5,
                description: `Fee data approved: ${item.service_type}`,
                created_at: new Date().toISOString()
              });
            }
          } else {
            console.error('ERROR: Item not found for validation with ID:', id);
          }
          console.log('After - Total feeData:', MOCK_DATA.feeData.length);
          console.log('=== END VALIDATE DEBUG ===');
          return { data: { success: true } };
        } else {
          // Handle submission - create complete data object
          const userId = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).id : '1';
          const userName = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).fullName : 'Demo User';

          console.log('=== SUBMIT FEE DATA DEBUG ===');
          console.log('Before submit - Total feeData:', MOCK_DATA.feeData.length);
          console.log('Submitting data:', data);

          // Validate all required fields
          if (!data.submitterName || !data.serviceProvider || !data.feeAmount || !data.financialDate) {
            console.error('ERROR: Missing required fields!', {
              submitterName: data.submitterName,
              serviceProvider: data.serviceProvider,
              feeAmount: data.feeAmount,
              financialDate: data.financialDate
            });
            return { data: { error: 'Missing required fields' } };
          }

          const newItem = {
            id: Date.now(),
            status: 'PENDING',
            contributor_id: userId,
            contributor_name: userName,
            // Map all 14 fields properly
            submitter_name: data.submitterName,
            submitter_division: data.submitterDivision,
            submitter_input_date: data.submitterInputDate,
            service_provider: data.serviceProvider,
            service_recipient: data.serviceRecipient,
            service_type: data.serviceType,
            scope_of_work: data.scopeOfWork,
            tax_year: data.taxYear,
            financial_type: data.financialType,
            financial_description: data.financialDescription,
            fee_scheme: data.feeScheme,
            fee_amount: data.feeAmount,
            currency: data.currency || 'IDR',
            financial_date: data.financialDate,
            created_at: new Date().toISOString()
          };

          console.log('Creating new item:', newItem);
          MOCK_DATA.feeData.push(newItem);
          console.log('After submit - Total feeData:', MOCK_DATA.feeData.length);
          console.log('=== END SUBMIT DEBUG ===');

          return { data: newItem };
        }
      } else if (endpoint.includes('/cross-division-data')) {
        if (endpoint.includes('/validate')) {
          // Handle validation
          const id = parseInt(endpoint.split('/')[2]);
          const item = MOCK_DATA.crossDivisionData.find(v => v.id === id);
          if (item) {
            const oldStatus = item.status;
            item.status = data.decision === 'ACCEPT' ? 'ACCEPTED' : data.decision === 'REJECT' ? 'REJECTED' : 'NEEDS_CLARIFICATION';
            // Reset clarification_submitted when validator requests new clarification
            if (data.decision !== 'ACCEPT' && data.decision !== 'REJECT') {
              item.clarification_submitted = false;
            }

            // If accepted, add points to contributor
            if (data.decision === 'ACCEPT' && oldStatus !== 'ACCEPTED') {
              const contributorId = item.contributor_id;

              // Add 5 points
              if (!MOCK_DATA.pointTransactions[contributorId]) {
                MOCK_DATA.pointTransactions[contributorId] = [];
              }

              MOCK_DATA.pointTransactions[contributorId].push({
                id: Date.now(),
                contributor_id: contributorId,
                points: 5,
                transaction_type: 'EARN',
                description: `Cross-division data approved: ${item.title}`,
                created_at: new Date().toISOString()
              });

              // Update points history
              if (!MOCK_DATA.points[contributorId]) {
                MOCK_DATA.points[contributorId] = {
                  totalPoints: 0,
                  history: []
                };
              }

              MOCK_DATA.points[contributorId].totalPoints += 5;
              MOCK_DATA.points[contributorId].history.push({
                points: 5,
                description: `Cross-division data approved: ${item.title}`,
                created_at: new Date().toISOString()
              });
            }
          }
          return { data: { success: true } };
        } else {
          // Handle submission - create complete data object
          const userId = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).id : '1';
          const userName = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).fullName : 'Demo User';

          // Handle file attachment from FormData
          let attachmentName = null;
          let attachmentUrl = null;
          if (data instanceof FormData) {
            const file = data.get('attachment');
            if (file && file.name && file.size > 0) {
              attachmentName = file.name;
              try { attachmentUrl = URL.createObjectURL(file); } catch (e) { attachmentUrl = null; }
            }
          }

          const newItem = {
            id: Date.now(),
            status: 'PENDING',
            contributor_id: userId,
            contributor_name: userName,
            // Map all cross-division fields properly (support both FormData and plain object)
            title: data instanceof FormData ? data.get('title') : data.title,
            division_category: data instanceof FormData ? data.get('divisionCategory') : data.divisionCategory,
            description: data instanceof FormData ? data.get('description') : data.description,
            submission_date: data instanceof FormData ? data.get('submissionDate') : data.submissionDate,
            attachment_url: attachmentUrl,
            attachment_name: attachmentName,
            created_at: new Date().toISOString()
          };
          MOCK_DATA.crossDivisionData.push(newItem);
          return { data: newItem };
        }
      } else if (endpoint.includes('/redeem-points')) {
        // Handle point redemption
        const userId = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).id : '1';
        const userName = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')).fullName : 'Demo User';
        const pointsToRedeem = data.points;

        // Deduct points
        if (!MOCK_DATA.points[userId]) {
          MOCK_DATA.points[userId] = { totalPoints: 0, history: [] };
        }

        MOCK_DATA.points[userId].totalPoints -= pointsToRedeem;

        // Add redemption transaction
        if (!MOCK_DATA.pointTransactions[userId]) {
          MOCK_DATA.pointTransactions[userId] = [];
        }

        MOCK_DATA.pointTransactions[userId].push({
          id: Date.now(),
          contributor_id: userId,
          points: -pointsToRedeem,
          transaction_type: 'REDEEM',
          description: `Redeemed ${pointsToRedeem} points`,
          created_at: new Date().toISOString()
        });

        // Create notification for all validators
        MOCK_DATA.notifications.push({
          id: Date.now(),
          recipient_role: 'VALIDATOR',
          type: 'POINT_REDEMPTION',
          title: 'Point Redemption Request',
          message: `${userName} has redeemed ${pointsToRedeem} points`,
          data: JSON.stringify({
            contributor_id: userId,
            contributor_name: userName,
            points: pointsToRedeem,
            redemption_id: Date.now(),
            reward_given: false // Track if reward has been given
          }),
          is_read: false,
          created_at: new Date().toISOString()
        });

        return { data: { success: true, message: 'Points redeemed successfully' } };
        // (clarification block moved to top)
      } else if (endpoint.includes('/mark-reward-given')) {
        // Handle marking reward as given
        const notificationId = parseInt(endpoint.split('/')[2]);
        const notification = MOCK_DATA.notifications.find(n => n.id === notificationId);

        if (notification) {
          const notifData = JSON.parse(notification.data);
          notifData.reward_given = true;
          notifData.reward_given_at = new Date().toISOString();
          notification.data = JSON.stringify(notifData);
        }

        return { data: { success: true } };
      }

      return { data: { success: true } };
    }

    return axios.post(`${API_URL}${endpoint}`, data, {
      ...config,
      headers: {
        ...getAuthHeaders(),
        ...config.headers
      }
    });
  },

  put: async (endpoint, data) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { data: { success: true } };
    }

    return axios.put(`${API_URL}${endpoint}`, data, {
      headers: getAuthHeaders()
    });
  }
};

export default api;
export { DEMO_MODE };
