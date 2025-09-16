-- Clear existing sample data before inserting new data
DELETE FROM member_authentication WHERE username IN ('asmith', 'bjohnson', 'cwhite', 'dgreen', 'ebrown', 'fdavis', 'gevans', 'hfoster', 'igreen', 'jhall');
DELETE FROM member_payments WHERE member_id IN (SELECT id FROM members WHERE bspcp_membership_number LIKE 'BSPCP-%');
DELETE FROM member_certificates WHERE member_id IN (SELECT id FROM members WHERE bspcp_membership_number LIKE 'BSPCP-%');
DELETE FROM member_personal_documents WHERE member_id IN (SELECT id FROM members WHERE bspcp_membership_number LIKE 'BSPCP-%');
DELETE FROM member_contact_details WHERE member_id IN (SELECT id FROM members WHERE bspcp_membership_number LIKE 'BSPCP-%');
DELETE FROM member_professional_details WHERE member_id IN (SELECT id FROM members WHERE bspcp_membership_number LIKE 'BSPCP-%');
DELETE FROM members WHERE bspcp_membership_number LIKE 'BSPCP-%';

-- Member 1: Dr. Alice Smith
DO $$
DECLARE
    member_1_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Dr. Alice Smith', 'BSPCP-001', '1234567890123', '1980-01-15', 'Female', 'Botswana', 'approved', 'active', 'Approved after review.')
    RETURNING id INTO member_1_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_1_id, 'Clinical Psychologist', 'Gaborone Mental Health', 'PhD Clinical Psychology', NULL, NULL, ARRAY['Depression & Anxiety', 'Stress Management'], 'Employed', '10 years', 'Experienced clinical psychologist.', 'Dr.', ARRAY['English', 'Setswana'], ARRAY['in-person', 'online'], 'P500-P800', 'Weekdays');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_1_id, '+267 71111111', 'alice.smith@example.com', 'www.alicesmith.com', 'Plot 101, Extension 10', 'Gaborone', 'John Smith', '+267 72222222', TRUE, TRUE, TRUE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_1_id, 'server/uploads/1757156754106-itekeng 3sets.pdf', NULL); -- Removed profile image

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_1_id, 'public/uploads/cb7bf666-f956-408d-884e-b05416c37837.png', 'PhD Certificate.png');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_1_id, 'server/uploads/1757157616174-itekeng.pdf'); -- Added proof of payment

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_1_id, 'asmith', '$2b$10$ubPTBbCGmTX1rM2AK2qpsuDeFO4nIJkh7x75IYDq1eX.N/NsfOZD6', '$2b$10$ubPTBbCGmTX1rM2AK2qpsu');
END $$;

-- Member 2: Mr. Bob Johnson
DO $$
DECLARE
    member_2_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Mr. Bob Johnson', 'BSPCP-002', '9876543210987', '1992-05-20', 'Male', 'South Africa', 'pending', 'pending', NULL)
    RETURNING id INTO member_2_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_2_id, 'Counselling Psychologist', 'Hope & Healing Center', 'MSc Counselling Psychology', NULL, NULL, ARRAY['Trauma & PTSD', 'Grief & Loss'], 'Self-employed', '5 years', 'Passionate about helping individuals heal.', 'Mr.', ARRAY['English', 'Zulu'], ARRAY['online'], 'P400-P700', 'Evenings');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_2_id, '+267 73333333', 'bob.johnson@example.com', NULL, 'Unit 5, Block 3, Phakalane', 'Gaborone', 'Jane Johnson', '+267 74444444', TRUE, TRUE, FALSE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_2_id, 'server/uploads/1757156754170-itekeng 2seth.pdf', NULL); -- Removed profile image

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_2_id, 'public/uploads/First_Annual_BSPCP.jpg', 'MSc Certificate.jpg');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_2_id, 'server/uploads/1757157616149-itekeng 3sets.pdf'); -- Added proof of payment

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_2_id, 'bjohnson', '$2b$10$r2EiW8lQPEoqVlepIOFnzeS4BL69wMmVqO4jn8gn3YMgOxx2EpLwS', '$2b$10$r2EiW8lQPEoqVlepIOFnze');
END $$;

-- Member 3: Ms. Carol White
DO $$
DECLARE
    member_3_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Ms. Carol White', 'BSPCP-003', '1122334455667', '1988-11-01', 'Female', 'Botswana', 'under_review', 'pending', NULL)
    RETURNING id INTO member_3_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_3_id, 'Family Therapist', 'Family Wellness Clinic', 'MA Family Therapy', 'Cert. Child Psychology', NULL, ARRAY['Family Conflicts', 'Child Behavioral Issues'], 'Employed', '7 years', 'Dedicated to fostering healthy family dynamics.', 'Ms.', ARRAY['English', 'Setswana'], ARRAY['in-person'], 'P600-P900', 'Weekends');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_3_id, '+267 75555555', 'carol.white@example.com', NULL, 'Street 20, Block 9', 'Francistown', 'David White', '+267 76666666', TRUE, FALSE, TRUE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_3_id, 'server/uploads/1757156754210-itekeng 2mat.pdf', NULL); -- Removed profile image

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_3_id, 'public/uploads/cb7bf666-f956-408d-884e-b05416c37837.png', 'MA Certificate.png');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_3_id, 'server/uploads/1757157616104-itekeng 3sets.pdf'); -- Added proof of payment

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_3_id, 'cwhite', '$2b$10$xnjWCu0JJXUEO0wvcIHfFuEgbXRb8UWoDikucLucHTcoxWEOI2kkG', '$2b$10$xnjWCu0JJXUEO0wvcIHfFu');
END $$;

-- Member 4: Dr. David Green
DO $$
DECLARE
    member_4_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Dr. David Green', 'BSPCP-004', '7788990011223', '1975-03-25', 'Male', 'Zimbabwe', 'pending', 'pending', NULL)
    RETURNING id INTO member_4_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_4_id, 'Psychiatrist', 'National Psychiatric Hospital', 'MD Psychiatry', 'Fellowship in Child Psychiatry', 'Several peer-reviewed articles', ARRAY['Child & Adolescent', 'Developmental Concerns'], 'Employed', '20 years', 'Leading psychiatrist with extensive experience.', 'Dr.', ARRAY['English', 'Shona'], ARRAY['in-person', 'online'], 'P1000-P1500', 'Weekdays');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_4_id, '+267 78888888', 'david.green@example.com', NULL, 'Hospital Road, Extension 1', 'Gaborone', 'Sarah Green', '+267 79999999', TRUE, TRUE, TRUE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_4_id, 'server/uploads/1757157616104-itekeng 3sets.pdf', NULL); -- Removed profile image

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_4_id, 'public/uploads/First_Annual_BSPCP.jpg', 'MD Certificate.jpg');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_4_id, 'server/uploads/1757157616104-itekeng 3sets.pdf'); -- Added proof of payment

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_4_id, 'dgreen', '$2b$10$ApZi/xuvIT4ad6ZEWtlAz.U5AY1vRErZjg8LLDu36vnrthLS7JCLm', '$2b$10$ApZi/xuvIT4ad6ZEWtlAz.');
END $$;

-- Member 5: Ms. Emily Brown
DO $$
DECLARE
    member_5_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Ms. Emily Brown', 'BSPCP-005', '2233445566778', '1985-08-10', 'Female', 'Botswana', 'approved', 'active', 'Approved after review.')
    RETURNING id INTO member_5_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_5_id, 'Counsellor', 'Wellness Hub', 'MA Counselling', NULL, NULL, ARRAY['Stress Management', 'Depression & Anxiety'], 'Self-employed', '8 years', 'Dedicated to helping clients achieve mental wellness.', 'Ms.', ARRAY['English', 'Setswana'], ARRAY['online'], 'P450-P750', 'Weekdays & Evenings');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_5_id, '+267 71234567', 'emily.brown@example.com', 'www.emilybrowncounselling.com', 'Plot 20, Village', 'Gaborone', 'Peter Brown', '+267 72345678', TRUE, TRUE, TRUE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_5_id, 'server/uploads/1757270505514-sg2.png', 'public/uploads/62e60043-5351-4cad-b6c4-92743d7c0bc8.png');

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_5_id, 'public/uploads/cb7bf666-f956-408d-884e-b05416c37837.png', 'MA Counselling Certificate.png');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_5_id, 'server/uploads/1757270523887-sg.png');

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_5_id, 'ebrown', '$2b$10$ubPTBbCGmTX1rM2AK2qpsuDeFO4nIJkh7x75IYDq1eX.N/NsfOZD6', '$2b$10$ubPTBbCGmTX1rM2AK2qpsu');
END $$;

-- Member 6: Mr. Frank Davis
DO $$
DECLARE
    member_6_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Mr. Frank Davis', 'BSPCP-006', '3344556677889', '1978-03-01', 'Male', 'Botswana', 'approved', 'active', 'Approved after review.')
    RETURNING id INTO member_6_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_6_id, 'Psychotherapist', 'Mindful Living Clinic', 'MSc Psychotherapy', 'Cert. CBT', NULL, ARRAY['Depression & Anxiety', 'Trauma & PTSD'], 'Employed', '15 years', 'Providing compassionate and effective psychotherapy.', 'Mr.', ARRAY['English'], ARRAY['in-person'], 'P600-P900', 'Weekdays');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_6_id, '+267 73456789', 'frank.davis@example.com', NULL, 'Unit 1, CBD', 'Gaborone', 'Grace Davis', '+267 74567890', TRUE, TRUE, TRUE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_6_id, 'server/uploads/1757270639623-test.jpg', 'public/uploads/cb7bf666-f956-408d-884e-b05416c37837.png');

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_6_id, 'public/uploads/d33be909-25aa-4725-8b88-0ed0fa9a41d5.png', 'MSc Psychotherapy Certificate.png');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_6_id, 'server/uploads/1757270664865-test.jpg');

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_6_id, 'fdavis', '$2b$10$r2EiW8lQPEoqVlepIOFnzeS4BL69wMmVqO4jn8gn3YMgOxx2EpLwS', '$2b$10$r2EiW8lQPEoqVlepIOFnze');
END $$;

-- Member 7: Dr. Grace Evans
DO $$
DECLARE
    member_7_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Dr. Grace Evans', 'BSPCP-007', '4455667788990', '1970-12-20', 'Female', 'South Africa', 'approved', 'active', 'Approved after review.')
    RETURNING id INTO member_7_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_7_id, 'Child Psychologist', 'Kids Therapy Centre', 'PhD Child Psychology', NULL, 'Published in Journal of Child Psychology', ARRAY['Child Behavioral Issues', 'Developmental Concerns'], 'Employed', '22 years', 'Specializing in child and adolescent mental health.', 'Dr.', ARRAY['English', 'Afrikaans'], ARRAY['in-person', 'online'], 'P700-P1000', 'Weekdays');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_7_id, '+267 75678901', 'grace.evans@example.com', NULL, 'Plot 50, Phase 2', 'Francistown', 'Henry Evans', '+267 76789012', TRUE, TRUE, TRUE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_7_id, 'server/uploads/1757270736992-test.jpg', 'public/uploads/d33be909-25aa-4725-8b88-0ed0fa9a41d5.png');

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_7_id, 'public/uploads/First_Annual_BSPCP.jpg', 'PhD Child Psychology Certificate.jpg');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_7_id, 'server/uploads/1757272512247-test.jpg');

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_7_id, 'gevans', '$2b$10$xnjWCu0JJXUEO0wvcIHfFuEgbXRb8UWoDikucLucHTcoxWEOI2kkG', '$2b$10$xnjWCu0JJXUEO0wvcIHfFu');
END $$;

-- Member 8: Mr. Harry Foster
DO $$
DECLARE
    member_8_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Mr. Harry Foster', 'BSPCP-008', '5566778899001', '1982-06-18', 'Male', 'Botswana', 'approved', 'active', 'Approved after review.')
    RETURNING id INTO member_8_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_8_id, 'Addiction Counsellor', 'Recovery Centre', 'Dip. Addiction Counselling', NULL, NULL, ARRAY['Addiction Support', 'Recovery'], 'Employed', '12 years', 'Supporting individuals on their journey to recovery.', 'Mr.', ARRAY['English', 'Setswana'], ARRAY['in-person'], 'P500-P800', 'Weekdays');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_8_id, '+267 76789012', 'harry.foster@example.com', 'www.recoverycentre.org', 'Plot 15, Industrial', 'Maun', 'Ivy Foster', '+267 77890123', TRUE, TRUE, TRUE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_8_id, 'server/uploads/1757272540183-test.jpg', 'public/uploads/62e60043-5351-4cad-b6c4-92743d7c0bc8.png');

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_8_id, 'public/uploads/cb7bf666-f956-408d-884e-b05416c37837.png', 'Diploma Addiction Counselling.png');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_8_id, 'server/uploads/1757272739566-test.jpg');

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_8_id, 'hfoster', '$2b$10$ubPTBbCGmTX1rM2AK2qpsuDeFO4nIJkh7x75IYDq1eX.N/NsfOZD6', '$2b$10$ubPTBbCGmTX1rM2AK2qpsu');
END $$;

-- Member 9: Ms. Ivy Green
DO $$
DECLARE
    member_9_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Ms. Ivy Green', 'BSPCP-009', '6677889900112', '1990-02-28', 'Female', 'Botswana', 'approved', 'active', 'Approved after review.')
    RETURNING id INTO member_9_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_9_id, 'Grief Counsellor', 'Serenity Support', 'Cert. Grief Counselling', NULL, NULL, ARRAY['Grief & Loss', 'Bereavement'], 'Self-employed', '6 years', 'Helping individuals navigate loss and find healing.', 'Ms.', ARRAY['English', 'Setswana'], ARRAY['online'], 'P400-P700', 'Evenings & Weekends');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_9_id, '+267 77890123', 'ivy.green@example.com', NULL, 'House 3, Block 7', 'Kasane', 'Jack Green', '+267 78901234', TRUE, TRUE, FALSE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_9_id, 'server/uploads/1757272777543-test.jpg', 'public/uploads/cb7bf666-f956-408d-884e-b05416c37837.png');

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_9_id, 'public/uploads/d33be909-25aa-4725-8b88-0ed0fa9a41d5.png', 'Grief Counselling Certificate.png');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_9_id, 'server/uploads/1757272831607-test.jpg');

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_9_id, 'igreen', '$2b$10$r2EiW8lQPEoqVlepIOFnzeS4BL69wMmVqO4jn8gn3YMgOxx2EpLwS', '$2b$10$r2EiW8lQPEoqVlepIOFnze');
END $$;

-- Member 10: Mr. Jack Hall
DO $$
DECLARE
    member_10_id UUID;
BEGIN
    INSERT INTO members (full_name, bspcp_membership_number, id_number, date_of_birth, gender, nationality, application_status, member_status, review_comment)
    VALUES ('Mr. Jack Hall', 'BSPCP-010', '7788990011223', '1980-09-05', 'Male', 'Botswana', 'approved', 'active', 'Approved after review.')
    RETURNING id INTO member_10_id;

    INSERT INTO member_professional_details (member_id, occupation, organization_name, highest_qualification, other_qualifications, scholarly_publications, specializations, employment_status, years_experience, bio, title, languages, session_types, fee_range, availability)
    VALUES (member_10_id, 'Career Counsellor', 'Future Pathways', 'MSc Career Guidance', NULL, NULL, ARRAY['Career Development', 'Work-Life Balance'], 'Employed', '10 years', 'Guiding professionals towards fulfilling careers.', 'Mr.', ARRAY['English', 'Setswana'], ARRAY['in-person', 'online'], 'P550-P850', 'Weekdays');

    INSERT INTO member_contact_details (member_id, phone, email, website, physical_address, city, emergency_contact, emergency_phone, show_email, show_phone, show_address)
    VALUES (member_10_id, '+267 78901234', 'jack.hall@example.com', 'www.futurepathways.com', 'Office Park, Extension 11', 'Gaborone', 'Kelly Hall', '+267 79012345', TRUE, TRUE, TRUE);

    INSERT INTO member_personal_documents (member_id, id_document_path, profile_image_path)
    VALUES (member_10_id, 'server/uploads/1757272994182-test.jpg', 'public/uploads/d33be909-25aa-4725-8b88-0ed0fa9a41d5.png');

    INSERT INTO member_certificates (member_id, file_path, original_filename)
    VALUES (member_10_id, 'public/uploads/First_Annual_BSPCP.jpg', 'MSc Career Guidance Certificate.jpg');

    INSERT INTO member_payments (member_id, proof_of_payment_path)
    VALUES (member_10_id, 'server/uploads/1757273248214-test.jpg');

    INSERT INTO member_authentication (member_id, username, password_hash, salt)
    VALUES (member_10_id, 'jhall', '$2b$10$ApZi/xuvIT4ad6ZEWtlAz.U5AY1vRErZjg8LLDu36vnrthLS7JCLm', '$2b$10$ApZi/xuvIT4ad6ZEWtlAz.');
END $$;
