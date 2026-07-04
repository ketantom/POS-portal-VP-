const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lvmwvcoyevimxvnltnln.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXd2Y295ZXZpbXh2bmx0bmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNzc5MTAsImV4cCI6MjA5ODc1MzkxMH0.kDadxSDc2wu42qb7lAJEIcpmZ9qOPjUU8AU-uDO98Zk'
);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'ketantom@gmail.com',
    password: 'Oneplustwo@3'
  });
  console.log('Login result:', { data, error });
}

testLogin();
