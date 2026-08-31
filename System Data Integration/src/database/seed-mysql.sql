-- Seed Data for MySQL
-- Fee Intelligence & Market Benchmarking System

-- Insert sample users
-- Password for all users: "password123" (hashed with bcrypt)
INSERT INTO users (id, username, password_hash, email, full_name, role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'contributor1', '$2b$10$rKZvFJxZ8qY9xGxZ8qY9xOZvFJxZ8qY9xGxZ8qY9xOZvFJxZ8qY9x', 'contributor1@muc.com', 'John Contributor', 'CONTRIBUTOR', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'validator1', '$2b$10$rKZvFJxZ8qY9xGxZ8qY9xOZvFJxZ8qY9xGxZ8qY9xOZvFJxZ8qY9x', 'validator1@muc.com', 'Jane Validator', 'VALIDATOR', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'partner1', '$2b$10$rKZvFJxZ8qY9xGxZ8qY9xOZvFJxZ8qY9xGxZ8qY9xOZvFJxZ8qY9x', 'partner1@muc.com', 'Bob Partner', 'PARTNER', TRUE),
('550e8400-e29b-41d4-a716-446655440004', 'manager1', '$2b$10$rKZvFJxZ8qY9xGxZ8qY9xOZvFJxZ8qY9xGxZ8qY9xOZvFJxZ8qY9x', 'manager1@muc.com', 'Alice Manager', 'SPV_MANAGER_PM', TRUE);

-- Insert sample fee data (with new 16-field structure)
INSERT INTO fee_data (
    id, contributor_id,
    submitter_name, submitter_division, submitter_input_date,
    service_provider, service_recipient,
    service_type, scope_of_work, tax_year,
    financial_type, financial_description, fee_scheme, fee_amount, currency, financial_date,
    status
) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
 'John Contributor', 'Tax Advisory', '2024-01-15',
 'PT ABC Consulting', 'PT XYZ Corporation',
 'Tax Consulting', 'Annual tax planning and compliance review', '2024',
 'Professional Fee', 'Comprehensive tax advisory services', 'Fixed Fee', 30000000.00, 'IDR', '2024-01-15',
 'ACCEPTED'),

('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
 'John Contributor', 'Tax Compliance', '2024-02-20',
 'PT DEF Advisors', 'PT LMN Industries',
 'Transfer Pricing', 'Transfer pricing documentation and analysis', '2024',
 'Consulting Fee', 'TP study for related party transactions', 'Percentage Fee', 45000000.00, 'IDR', '2024-02-20',
 'ACCEPTED'),

('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001',
 'John Contributor', 'Tax Dispute', '2024-03-10',
 'PT GHI Legal', 'PT OPQ Trading',
 'Tax Dispute Resolution', 'Tax objection and appeal representation', '2023',
 'Legal Fee', 'Representation in tax court proceedings', 'Hourly Rate', 25000000.00, 'IDR', '2024-03-10',
 'PENDING');

-- Insert sample cross-division data
INSERT INTO cross_division_data (
    id, contributor_id, title, division_category, description, submission_date, status
) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
 'New Tax Regulation Update', 'Tax Advisory',
 'Important updates on the latest tax regulations affecting corporate income tax calculations.',
 '2024-01-20', 'ACCEPTED'),

('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
 'Transfer Pricing Best Practices', 'Transfer Pricing',
 'Guidelines and best practices for transfer pricing documentation in Indonesia.',
 '2024-02-15', 'ACCEPTED'),

('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001',
 'Customs Clearance Procedures', 'Customs',
 'Updated procedures for customs clearance and import/export documentation.',
 '2024-03-05', 'PENDING');

-- Insert sample point transactions
INSERT INTO point_transactions (
    id, contributor_id, data_id, data_type, points, description
) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440001', 'FEE_DATA', 5,
 'Points awarded for accepted fee data submission'),

('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440002', 'FEE_DATA', 5,
 'Points awarded for accepted fee data submission'),

('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001',
 '750e8400-e29b-41d4-a716-446655440001', 'CROSS_DIVISION_DATA', 3,
 'Points awarded for accepted cross-division data submission');

-- Insert sample notifications
INSERT INTO notifications (
    id, user_id, type, message, metadata, is_read
) VALUES
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
 'DATA_ACCEPTED', 'Your fee data submission has been accepted. You earned 5 points!',
 '{"dataId": "650e8400-e29b-41d4-a716-446655440001", "points": 5}', FALSE),

('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002',
 'VALIDATION_REQUIRED', 'New fee data submission requires validation.',
 '{"dataId": "650e8400-e29b-41d4-a716-446655440003"}', FALSE);
