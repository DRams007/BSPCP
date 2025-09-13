export interface IMemberProfile {
  id: string; // UUID from database
  first_name: string;
  last_name: string;
  full_name: string; // Computed/concatenated for display purposes
  bspcp_membership_number?: string;
  id_number: string;
  date_of_birth: string; // DATE type
  gender: string;
  nationality: string;
  application_status: string;
  member_status: "active" | "pending" | "suspended";
  review_comment?: string;
  created_at?: string; // TIMESTAMP WITH TIME ZONE

  // From member_professional_details
  occupation?: string;
  organization_name?: string;
  highest_qualification?: string;
  other_qualifications?: string;
  scholarly_publications?: string;
  specializations?: string[];
  employment_status?: string;
  years_experience?: string; // VARCHAR(50)
  bio?: string;
  title?: string;
  languages?: string[];
  session_types?: string[];
  fee_range?: string;
  availability?: string;
  profile_photo_url?: string;
}

export interface IMemberContact {
  id: string; // UUID from database (member_id)
  phone?: string;
  email?: string;
  website?: string;
  physical_address?: string;
  city?: string;
  postal_address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  show_email?: boolean;
  show_phone?: boolean;
  show_address?: boolean;
}
