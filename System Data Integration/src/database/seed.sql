-- Fee Intelligence & Market Benchmarking System
-- Seed Data for Testing and Development
-- This file contains sample data for testing the system

-- Insert sample users (passwords are hashed for 'password123')
-- Password hash generated using bcrypt with salt rounds = 10
INSERT INTO users (id, username, password_hash, email, full_name, role, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'contributor1', '$2b$10$h9pqSgUr79K5OLj9Aks4NeZyR1t10C3PvEdNhxoyeGe82DviTZn0W', 'contributor1@mucglobal.com', 'John Contributor', 'CONTRIBUTOR', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'contributor2', '$2b$10$h9pqSgUr79K5OLj9Aks4NeZyR1t10C3PvEdNhxoyeGe82DviTZn0W', 'contributor2@mucglobal.com', 'Jane Contributor', 'CONTRIBUTOR', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'validator1', '$2b$10$h9pqSgUr79K5OLj9Aks4NeZyR1t10C3PvEdNhxoyeGe82DviTZn0W', 'validator1@mucglobal.com', 'Alice Validator', 'VALIDATOR', TRUE),
    ('44444444-4444-4444-4444-444444444444', 'partner1', '$2b$10$h9pqSgUr79K5OLj9Aks4NeZyR1t10C3PvEdNhxoyeGe82DviTZn0W', 'partner1@mucglobal.com', 'Bob Partner', 'PARTNER', TRUE),
    ('55555555-5555-5555-5555-555555555555', 'manager1', '$2b$10$h9pqSgUr79K5OLj9Aks4NeZyR1t10C3PvEdNhxoyeGe82DviTZn0W', 'manager1@mucglobal.com', 'Charlie Manager', 'SPV_MANAGER_PM', TRUE);

-- Insert sample fee data with various statuses (using new 16-field structure)
INSERT INTO fee_data (
    id, contributor_id, 
    submitter_name, submitter_division, submitter_input_date,
    service_provider, service_recipient,
    service_type, scope_of_work, tax_year,
    financial_type, financial_description, fee_scheme, fee_amount, currency, financial_date,
    status, validator_id, validation_notes, validated_at
) VALUES
    -- Accepted data
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
     'John Contributor', 'Tax Division', '2024-01-15',
     'KAP ABC & Partners', 'PT Maju Jaya',
     'Audit Services', 'Comprehensive financial audit for fiscal year 2023', '2023',
     'Professional Fee', 'Annual audit services including financial statement review', 'Fixed Fee', 150000000.00, 'IDR', '2024-01-15',
     'ACCEPTED', '33333333-3333-3333-3333-333333333333', 'Data verified and accepted', '2024-01-16 10:30:00+07'),
    
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 
     'Jane Contributor', 'Advisory Division', '2024-01-20',
     'Tax Consultant XYZ', 'PT Sejahtera Abadi',
     'Tax Consulting', 'Tax planning and compliance services', '2023',
     'Consulting Fee', 'Tax advisory for corporate restructuring', 'Hourly Rate', 75000000.00, 'IDR', '2024-01-20',
     'ACCEPTED', '33333333-3333-3333-3333-333333333333', 'Reliable source, accepted', '2024-01-21 14:15:00+07'),
    
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 
     'John Contributor', 'Tax Division', '2024-02-01',
     'Management Consulting Co', 'PT Berkah Sentosa',
     'Management Consulting', 'Strategic planning and organizational development', '2024',
     'Project Fee', 'Management consulting for business transformation', 'Fixed Fee', 200000000.00, 'IDR', '2024-02-01',
     'ACCEPTED', '33333333-3333-3333-3333-333333333333', 'Good data quality', '2024-02-02 09:00:00+07'),
    
    -- Pending data
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 
     'Jane Contributor', 'Advisory Division', '2024-02-10',
     'Financial Advisory Ltd', 'PT Mandiri Sukses',
     'Financial Advisory', 'Investment portfolio management and financial planning', '2024',
     'Advisory Fee', 'Comprehensive financial advisory services', 'Percentage', 120000000.00, 'IDR', '2024-02-10',
     'PENDING', NULL, NULL, NULL),
    
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 
     'John Contributor', 'Tax Division', '2024-02-15',
     'Risk Management Firm', 'PT Aman Terkendali',
     'Risk Assessment', 'Enterprise risk assessment and mitigation strategy', '2024',
     'Assessment Fee', 'Risk assessment for operational and financial risks', 'Fixed Fee', 90000000.00, 'IDR', '2024-02-15',
     'PENDING', NULL, NULL, NULL),
    
    -- Need clarification data
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 
     'Jane Contributor', 'Advisory Division', '2024-02-20',
     'IT Solutions Provider', 'PT Digital Nusantara',
     'IT Consulting', 'IT infrastructure consulting and implementation', '2024',
     'Consulting Fee', 'IT infrastructure modernization project', 'Time & Material', 180000000.00, 'IDR', '2024-02-20',
     'NEED_CLARIFICATION', '33333333-3333-3333-3333-333333333333', 'Please provide more details about the source and scope of services', '2024-02-21 11:00:00+07'),
    
    -- Rejected data
    ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 
     'John Contributor', 'Tax Division', '2024-02-25',
     'General Consulting Inc', 'PT Usaha Bersama',
     'General Consulting', 'General business consulting services', '2024',
     'Consulting Fee', 'General consulting and advisory', 'Fixed Fee', 50000000.00, 'IDR', '2024-02-25',
     'REJECTED', '33333333-3333-3333-3333-333333333333', 'Source cannot be verified, data quality insufficient', '2024-02-26 16:30:00+07');

-- Insert sample cross-division data (with submission_date and proper divisions)
INSERT INTO cross_division_data (id, contributor_id, title, division_category, description, submission_date, attachment_url, status, validator_id, validation_notes, validated_at) VALUES
    -- Accepted data
    ('aaaabbbb-aaaa-bbbb-aaaa-aaaabbbbaaaa', '11111111-1111-1111-1111-111111111111', 'Best Practices for Client Engagement', 'Tax Advisory', 'Document containing proven strategies for improving client engagement and retention rates in tax advisory services', '2024-01-17', 'https://storage.example.com/docs/client-engagement-2024.pdf', 'ACCEPTED', '33333333-3333-3333-3333-333333333333', 'Valuable insights, approved for sharing', '2024-01-18 13:00:00+07'),
    ('bbbbcccc-bbbb-cccc-bbbb-bbbbccccbbbb', '22222222-2222-2222-2222-222222222222', 'New Regulatory Compliance Guidelines', 'Legal', 'Updated compliance requirements for financial services sector and legal considerations', '2024-01-24', NULL, 'ACCEPTED', '33333333-3333-3333-3333-333333333333', 'Important information, accepted', '2024-01-25 10:45:00+07'),
    ('11112222-1111-2222-1111-111122221111', '11111111-1111-1111-1111-111111111111', 'Transfer Pricing Documentation Standards', 'Transfer Pricing', 'Comprehensive guide for transfer pricing documentation and compliance', '2024-01-28', NULL, 'ACCEPTED', '33333333-3333-3333-3333-333333333333', 'Excellent resource', '2024-01-29 09:00:00+07'),
    ('22223333-2222-3333-2222-222233332222', '22222222-2222-2222-2222-222222222222', 'Customs Clearance Best Practices', 'Customs', 'Best practices for efficient customs clearance and import/export procedures', '2024-02-01', 'https://storage.example.com/docs/customs-guide.pdf', 'ACCEPTED', '33333333-3333-3333-3333-333333333333', 'Very useful', '2024-02-02 10:00:00+07'),
    
    -- Pending data
    ('ccccdddd-cccc-dddd-cccc-ccccddddcccc', '11111111-1111-1111-1111-111111111111', 'Technology Stack Recommendations', 'Accounting', 'Recommendations for modernizing accounting technology infrastructure and automation', '2024-02-17', 'https://storage.example.com/docs/tech-stack-2024.pdf', 'PENDING', NULL, NULL, NULL),
    ('33334444-3333-4444-3333-333344443333', '22222222-2222-2222-2222-222222222222', 'Tax Dispute Resolution Strategies', 'Tax Dispute', 'Effective strategies for resolving tax disputes with authorities', '2024-02-18', NULL, 'PENDING', NULL, NULL, NULL),
    ('44445555-4444-5555-4444-444455554444', '11111111-1111-1111-1111-111111111111', 'Tax Compliance Checklist 2024', 'Tax Compliance', 'Comprehensive checklist for annual tax compliance requirements', '2024-02-19', 'https://storage.example.com/docs/compliance-checklist.pdf', 'PENDING', NULL, NULL, NULL),
    
    -- Need clarification data
    ('ddddeee-dddd-eeee-dddd-ddddeeeedddd', '22222222-2222-2222-2222-222222222222', 'HR Policy Updates', 'Accounting', 'Proposed updates to accounting department HR policies', '2024-02-21', NULL, 'NEED_CLARIFICATION', '33333333-3333-3333-3333-333333333333', 'Please clarify which specific policies are being updated', '2024-02-22 14:30:00+07');

-- Insert clarification history
INSERT INTO clarification_history (data_id, data_type, requested_by, requested_at, request_notes, responded_by, responded_at, response_notes) VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'FEE_DATA', '33333333-3333-3333-3333-333333333333', '2024-02-21 11:00:00+07', 'Please provide more details about the source and scope of services', NULL, NULL, NULL),
    ('ddddeee-dddd-eeee-dddd-ddddeeeedddd', 'CROSS_DIVISION_DATA', '33333333-3333-3333-3333-333333333333', '2024-02-22 14:30:00+07', 'Please clarify which specific policies are being updated', NULL, NULL, NULL);

-- Insert point transactions for accepted data
INSERT INTO point_transactions (contributor_id, data_id, data_type, points, description, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'FEE_DATA', 1, 'Points awarded for accepted fee data', '2024-01-16 10:30:00+07'),
    ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'FEE_DATA', 1, 'Points awarded for accepted fee data', '2024-01-21 14:15:00+07'),
    ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'FEE_DATA', 1, 'Points awarded for accepted fee data', '2024-02-02 09:00:00+07'),
    ('11111111-1111-1111-1111-111111111111', 'aaaabbbb-aaaa-bbbb-aaaa-aaaabbbbaaaa', 'CROSS_DIVISION_DATA', 1, 'Points awarded for accepted cross-division data', '2024-01-18 13:00:00+07'),
    ('22222222-2222-2222-2222-222222222222', 'bbbbcccc-bbbb-cccc-bbbb-bbbbccccbbbb', 'CROSS_DIVISION_DATA', 1, 'Points awarded for accepted cross-division data', '2024-01-25 10:45:00+07');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, message, metadata, is_read, created_at, read_at) VALUES
    -- Notifications for contributor1
    ('11111111-1111-1111-1111-111111111111', 'DATA_ACCEPTED', 'Your fee data submission has been accepted', '{"dataId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "dataType": "FEE_DATA", "points": 1}', TRUE, '2024-01-16 10:30:00+07', '2024-01-16 11:00:00+07'),
    ('11111111-1111-1111-1111-111111111111', 'POINTS_EARNED', 'You earned 1 point! Total: 1 points', '{"points": 1, "totalPoints": 1}', TRUE, '2024-01-16 10:30:00+07', '2024-01-16 11:00:00+07'),
    ('11111111-1111-1111-1111-111111111111', 'DATA_ACCEPTED', 'Your fee data submission has been accepted', '{"dataId": "cccccccc-cccc-cccc-cccc-cccccccccccc", "dataType": "FEE_DATA", "points": 1}', TRUE, '2024-02-02 09:00:00+07', '2024-02-02 10:00:00+07'),
    ('11111111-1111-1111-1111-111111111111', 'DATA_REJECTED', 'Your fee data submission has been rejected', '{"dataId": "99999999-9999-9999-9999-999999999999", "dataType": "FEE_DATA"}', FALSE, '2024-02-26 16:30:00+07', NULL),
    
    -- Notifications for contributor2
    ('22222222-2222-2222-2222-222222222222', 'DATA_ACCEPTED', 'Your fee data submission has been accepted', '{"dataId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "dataType": "FEE_DATA", "points": 1}', TRUE, '2024-01-21 14:15:00+07', '2024-01-21 15:00:00+07'),
    ('22222222-2222-2222-2222-222222222222', 'CLARIFICATION_NEEDED', 'Your fee data submission needs clarification', '{"dataId": "ffffffff-ffff-ffff-ffff-ffffffffffff", "dataType": "FEE_DATA"}', FALSE, '2024-02-21 11:00:00+07', NULL),
    ('22222222-2222-2222-2222-222222222222', 'CLARIFICATION_NEEDED', 'Your cross-division data submission needs clarification', '{"dataId": "ddddeee-dddd-eeee-dddd-ddddeeeedddd", "dataType": "CROSS_DIVISION_DATA"}', FALSE, '2024-02-22 14:30:00+07', NULL),
    
    -- Notifications for validator
    ('33333333-3333-3333-3333-333333333333', 'VALIDATION_REQUIRED', 'New fee data submitted and requires validation', '{"dataId": "dddddddd-dddd-dddd-dddd-dddddddddddd", "dataType": "FEE_DATA"}', FALSE, '2024-02-10 09:00:00+07', NULL),
    ('33333333-3333-3333-3333-333333333333', 'VALIDATION_REQUIRED', 'New fee data submitted and requires validation', '{"dataId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", "dataType": "FEE_DATA"}', FALSE, '2024-02-15 10:00:00+07', NULL),
    ('33333333-3333-3333-3333-333333333333', 'VALIDATION_REQUIRED', 'New cross-division data submitted and requires validation', '{"dataId": "ccccdddd-cccc-dddd-cccc-ccccddddcccc", "dataType": "CROSS_DIVISION_DATA"}', FALSE, '2024-02-18 11:00:00+07', NULL);

-- Insert sample audit logs
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, changes, ip_address, user_agent, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'CREATE', 'FEE_DATA', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"source": "Market Report Q1 2024", "service_type": "Audit Services", "fee_amount": 150000000.00}', '192.168.1.100', 'Mozilla/5.0', '2024-01-15 14:00:00+07'),
    ('33333333-3333-3333-3333-333333333333', 'VALIDATE', 'FEE_DATA', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"status": "ACCEPTED", "validation_notes": "Data verified and accepted"}', '192.168.1.101', 'Mozilla/5.0', '2024-01-16 10:30:00+07'),
    ('22222222-2222-2222-2222-222222222222', 'CREATE', 'FEE_DATA', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"source": "Professional Network", "service_type": "Tax Consulting", "fee_amount": 75000000.00}', '192.168.1.102', 'Mozilla/5.0', '2024-01-20 09:30:00+07'),
    ('33333333-3333-3333-3333-333333333333', 'VALIDATE', 'FEE_DATA', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"status": "ACCEPTED", "validation_notes": "Reliable source, accepted"}', '192.168.1.101', 'Mozilla/5.0', '2024-01-21 14:15:00+07'),
    ('11111111-1111-1111-1111-111111111111', 'CREATE', 'CROSS_DIVISION_DATA', 'aaaabbbb-aaaa-bbbb-aaaa-aaaabbbbaaaa', '{"title": "Best Practices for Client Engagement", "division_category": "Sales & Marketing"}', '192.168.1.100', 'Mozilla/5.0', '2024-01-17 16:00:00+07'),
    ('33333333-3333-3333-3333-333333333333', 'VALIDATE', 'CROSS_DIVISION_DATA', 'aaaabbbb-aaaa-bbbb-aaaa-aaaabbbbaaaa', '{"status": "ACCEPTED", "validation_notes": "Valuable insights, approved for sharing"}', '192.168.1.101', 'Mozilla/5.0', '2024-01-18 13:00:00+07'),
    ('44444444-4444-4444-4444-444444444444', 'VIEW', 'FEE_DATA', NULL, '{"filters": {"status": "ACCEPTED", "service_type": "Audit Services"}}', '192.168.1.103', 'Mozilla/5.0', '2024-02-01 10:00:00+07'),
    ('55555555-5555-5555-5555-555555555555', 'EXPORT', 'FEE_DATA', NULL, '{"format": "CSV", "count": 3}', '192.168.1.104', 'Mozilla/5.0', '2024-02-05 14:30:00+07');

-- Display summary
SELECT 'Database seeded successfully!' AS status;
SELECT 'Users created: ' || COUNT(*) AS users_count FROM users;
SELECT 'Fee data records: ' || COUNT(*) AS fee_data_count FROM fee_data;
SELECT 'Cross-division data records: ' || COUNT(*) AS cross_division_count FROM cross_division_data;
SELECT 'Notifications: ' || COUNT(*) AS notifications_count FROM notifications;
SELECT 'Point transactions: ' || COUNT(*) AS points_count FROM point_transactions;
SELECT 'Audit logs: ' || COUNT(*) AS audit_logs_count FROM audit_logs;
