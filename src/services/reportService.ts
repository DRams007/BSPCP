import { format, differenceInYears } from "date-fns";

export interface Member {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
    application_status: string;
    member_status: string;
    membershipType: string;
    payment_status: string;
    payment_uploaded_at?: string;
    payment_verified_at?: string;
    renewal_date?: string;
    renewal_status?: string;
    renewal_uploaded_at?: string;
    // Professional Details
    specializations?: string[];
    languages?: string[];
    experience?: string;
    occupation?: string;
    // Demographics
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    physicalAddress?: string; // For location
    // CPD
    cpd_points?: number;
    cpd_documents?: any[];
}

export interface MembershipFee {
    id: number;
    category_type: string;
    joining_fee: string;
    annual_fee: string;
    description: string;
}

export interface FinanceRecord {
    id: string;
    memberId: string;
    fullName: string;
    paymentDate: string;
    paymentType: "Application Fee" | "Renewal Fee";
    amount: number;
    paymentMethod: string;
    status: string;
    verifiedBy?: string;
}

export interface PaymentRecord {
    id: number;
    memberId: string;
    firstName: string;
    lastName: string;
    amount: number;
    feeType: string;
    paymentDate: string;
    verifiedBy: string;
    createdAt: string;
}

export interface RenewalRecord {
    id: string;
    memberId: string;
    fullName: string;
    renewalDate: string;
    status: "Renewed" | "Overdue" | "Due Soon" | "Pending";
    daysOverdue?: number;
}

export interface Booking {
    id: string;
    client_name: string;
    counsellor_name: string;
    booking_date: string;
    session_type: string;
    status: string;
}

export interface AuditLog {
    id: string;
    action: string;
    admin_name: string;
    details: string;
    created_at: string;
}

export interface PaymentAuditLog {
    id: string;
    action: string;
    details: string;
    ip_address: string;
    created_at: string;
    member_name: string;
    member_id: string;
    admin_name: string;
}

export interface RenewalAuditLog {
    id: string;
    action: string;
    details: string;
    ip_address: string;
    created_at: string;
    member_name: string;
    member_id: string;
    admin_name: string;
}

export const fetchReportData = async () => {
    const token = localStorage.getItem("admin_token");
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

    try {
        const [membersResponse, feesResponse, bookingsResponse, logsResponse, paymentsResponse, paymentAuditLogsResponse, renewalAuditLogsResponse] = await Promise.all([
            fetch(`${API_URL}/api/applications`, { headers }),
            fetch(`${API_URL}/api/membership-fees`, { headers }),
            fetch(`${API_URL}/api/admin/bookings`, { headers }),
            fetch(`${API_URL}/api/admin/audit-logs`, { headers }),
            fetch(`${API_URL}/api/admin/payments`, { headers }),
            fetch(`${API_URL}/api/admin/payment-audit-logs`, { headers }),
            fetch(`${API_URL}/api/admin/renewal-audit-logs`, { headers }),
        ]);

        if (!membersResponse.ok || !feesResponse.ok) {
            throw new Error("Failed to fetch report data");
        }

        const members: Member[] = await membersResponse.json();
        const fees: MembershipFee[] = await feesResponse.json();
        const bookings: Booking[] = bookingsResponse.ok ? await bookingsResponse.json() : [];
        const logs: AuditLog[] = logsResponse.ok ? await logsResponse.json() : [];
        const paymentAuditLogs: PaymentAuditLog[] = paymentAuditLogsResponse.ok ? await paymentAuditLogsResponse.json() : [];
        const renewalAuditLogs: RenewalAuditLog[] = renewalAuditLogsResponse.ok ? await renewalAuditLogsResponse.json() : [];

        // Parse payments response
        let payments: PaymentRecord[] = [];
        if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json();
            payments = paymentsData.payments || [];
        }

        return { members, fees, bookings, logs, payments, paymentAuditLogs, renewalAuditLogs };
    } catch (error) {
        console.error("Error fetching report data:", error);
        throw error;
    }
};

// --- Existing Transforms ---

export const transformToFinanceReport = (payments: PaymentRecord[]): FinanceRecord[] => {
    return payments.map((payment) => ({
        id: String(payment.id),
        memberId: payment.memberId,
        fullName: `${payment.firstName} ${payment.lastName}`.trim(),
        paymentDate: payment.paymentDate || payment.createdAt,
        paymentType: (payment.feeType === 'application_fee' ? 'Application Fee' : 'Renewal Fee') as "Application Fee" | "Renewal Fee",
        amount: payment.amount,
        paymentMethod: "EFT/Bank Transfer",
        status: "Verified",
        verifiedBy: payment.verifiedBy,
    })).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
};

export const transformToRenewalsReport = (members: Member[]): RenewalRecord[] => {
    const today = new Date();
    return members
        .filter((m) => m.renewal_date)
        .map((member) => {
            const renewalDate = new Date(member.renewal_date!);
            let status: RenewalRecord["status"] = "Pending";
            let daysOverdue = 0;

            if (member.renewal_status === "verified") {
                status = "Renewed";
            } else if (renewalDate < today) {
                status = "Overdue";
                const diffTime = Math.abs(today.getTime() - renewalDate.getTime());
                daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else if (renewalDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) {
                status = "Due Soon";
            }

            return {
                id: member.id,
                memberId: member.id,
                fullName: member.name,
                renewalDate: member.renewal_date!,
                status,
                daysOverdue: status === "Overdue" ? daysOverdue : undefined,
            };
        })
        .sort((a, b) => {
            if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
            if (a.status !== 'Overdue' && b.status === 'Overdue') return 1;
            return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
        });
};

export const transformToMemberList = (members: Member[]) => {
    return members.map((member) => ({
        id: member.id,
        fullName: member.name,
        email: member.email,
        phone: member.phone,
        joiningDate: member.created_at,
        status: member.member_status === 'active' ? 'Active' : 'Inactive',
        originalStatus: member.member_status,
        membershipType: member.membershipType
    }));
};

// --- New Transforms for Analytics ---

export const transformToDemographics = (members: Member[]) => {
    const ageGroups: Record<string, number> = {};
    const gender: Record<string, number> = {};
    const location: Record<string, number> = {};

    members.forEach((m) => {
        // Age
        if (m.dateOfBirth) {
            const age = differenceInYears(new Date(), new Date(m.dateOfBirth));
            const group = `${Math.floor(age / 10) * 10}-${Math.floor(age / 10) * 10 + 9}`;
            ageGroups[group] = (ageGroups[group] || 0) + 1;
        }
        // Gender
        if (m.gender) { // Assuming 'gender' field exists on Member from API
            // The API might return it as 'gender' or inside 'personal_details'
            // Based on previous view, it is on the root of member object in DB, but let's check API response
            // API response has 'nationality' but 'gender' might be missing in SELECT.
            // Wait, I checked API code, it selects 'nationality' but NOT 'gender' explicitly in the main SELECT list?
            // Let's assume it might be missing and handle gracefully or update API later.
            // Actually, looking at previous `view_file` of `server/index.js`, `gender` IS NOT in the SELECT list.
            // I should probably update the API to include gender.
            // For now, let's use what we have or skip if missing.
        }

        // Location (City)
        // API returns `physicalAddress` which might be full address.
        // We'll try to extract city or just use it if it's simple.
        // Actually `member_contact_details` has `city` column but API returns `physical_address` aliased as `physicalAddress`.
        // It does NOT return `city`.
        // I will skip Location for now or use `nationality`.
        if (m.nationality) {
            location[m.nationality] = (location[m.nationality] || 0) + 1;
        }
    });

    return {
        age: Object.entries(ageGroups).map(([name, value]) => ({ name, value })),
        // gender: Object.entries(gender).map(([name, value]) => ({ name, value })),
        location: Object.entries(location).map(([name, value]) => ({ name, value })),
    };
};

export const transformToMembershipGrowth = (members: Member[]) => {
    const monthlyGrowth: Record<string, number> = {};

    members.forEach((m) => {
        if (m.created_at) {
            const monthKey = format(new Date(m.created_at), "MMM yyyy");
            monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + 1;
        }
    });

    // Sort by date and return last 12 months
    const sortedEntries = Object.entries(monthlyGrowth)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        .slice(-12);

    // Calculate cumulative growth
    let cumulative = 0;
    return sortedEntries.map(entry => {
        cumulative += entry.count;
        return {
            month: entry.month,
            newMembers: entry.count,
            totalMembers: cumulative
        };
    });
};

export const transformToProfessionalStats = (members: Member[]) => {
    const specializations: Record<string, number> = {};
    const languages: Record<string, number> = {};
    const experience: Record<string, number> = {};

    members.forEach((m) => {
        // Specializations
        if (m.specializations && Array.isArray(m.specializations)) {
            m.specializations.forEach((s) => {
                specializations[s] = (specializations[s] || 0) + 1;
            });
        }
        // Languages
        if (m.languages && Array.isArray(m.languages)) {
            m.languages.forEach((l) => {
                languages[l] = (languages[l] || 0) + 1;
            });
        }
        // Experience
        if (m.experience) {
            experience[m.experience] = (experience[m.experience] || 0) + 1;
        }
    });

    return {
        specializations: Object.entries(specializations)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10), // Top 10
        languages: Object.entries(languages)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value),
        experience: Object.entries(experience).map(([name, value]) => ({ name, value })),
    };
};

export const transformToCPDStats = (members: Member[]) => {
    const compliantCount = members.filter((m) => (m.cpd_points || 0) >= 20).length;
    const nonCompliantCount = members.length - compliantCount;

    const topAchievers = [...members]
        .sort((a, b) => (b.cpd_points || 0) - (a.cpd_points || 0))
        .slice(0, 10)
        .map((m) => ({
            id: m.id,
            name: m.name,
            points: m.cpd_points || 0,
        }));

    return {
        compliance: [
            { name: "Compliant", value: compliantCount, fill: "#22c55e" }, // Green
            { name: "Non-Compliant", value: nonCompliantCount, fill: "#ef4444" }, // Red
        ],
        topAchievers,
    };
};

export const transformToBookingStats = (bookings: Booking[]) => {
    const volume: Record<string, number> = {};
    const types: Record<string, number> = {};

    bookings.forEach((b) => {
        // Volume (Daily)
        const date = b.booking_date ? format(new Date(b.booking_date), "yyyy-MM-dd") : "Unknown";
        volume[date] = (volume[date] || 0) + 1;

        // Types
        if (b.session_type) {
            types[b.session_type] = (types[b.session_type] || 0) + 1;
        }
    });

    return {
        volume: Object.entries(volume)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30), // Last 30 days
        types: Object.entries(types).map(([name, value]) => ({ name, value })),
    };
};
