
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhvourkpewcedxwzoide.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhodm91cmtwZXdjZWR4d3pvaWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NzM5OTAsImV4cCI6MjA4MDA0OTk5MH0.nBffOaRcCEoBNzedeAa8Ndo6mds3IlY-1F8vMie7N_A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Finding user...");
    // 1. Find the user profile to get clinic_id
    // We can't query auth.users directly with anon key usually, but we can query profiles if RLS allows or if we just search by email if profiles has it.
    // Actually, profiles usually has `id` which matches auth.uid.
    // Let's try to find the clinic first.

    // Since I just created "testadmin123@gmail.com", I can try to find the profile by querying profiles.
    // But profiles might not have email column exposed or populated depending on implementation.
    // However, I know the clinic name is likely "Consultorio de testadmin123@gmail.com" or similar if I used that username.
    // Wait, I used "testadmin123@gmail.com" as username in the last step?
    // Let's check the browser output.
    // Step 66: Text: "testadmin123@gmail.com"

    // Let's try to find the clinic by name or just insert into the first clinic found?
    // No, that might mess up other data.

    // Let's try to sign in first to get the user and clinic.
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'testadmin123@gmail.com',
        password: 'password123'
    });

    if (authError) {
        console.error("Auth error:", authError);
        return;
    }

    const user = authData.user;
    console.log("Logged in as:", user.email);

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const clinicId = profile.clinic_id;
    console.log("Clinic ID:", clinicId);

    // 2. Insert Appointment
    const today = new Date().toISOString().split('T')[0];
    const time = "10:00";

    const { data: apt, error: aptError } = await supabase.from('appointments').insert([
        {
            clinic_id: clinicId,
            patient_name: "Juan Perez Test",
            patient_dni: "12345678",
            patient_phone: "999888777",
            patient_age: "30 años",
            appointment_date: `${today}T${time}:00`,
            status: "pending",
            triage_status: "pending", // or whatever the default is
            symptoms: "Dolor de garganta y fiebre",
            payment_status: "pending"
        }
    ]).select();

    if (aptError) {
        console.error("Insert error:", aptError);
    } else {
        console.log("Inserted appointment:", apt);
    }
}

main();
