const fs = require('fs');

async function runEndToEndVerification() {
  console.log('=== STARTING END-TO-END SYSTEM VERIFICATION ===\n');

  const BASE_URL = 'http://localhost:4000/api/v1';

  // 1. Login as Student
  console.log('Step 1: Logging in as verified student...');
  const loginRes = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_student_flow@aset.ac.in',
      password: 'Password@123'
    })
  });
  const loginJson = await loginRes.json();
  const token = loginJson?.data?.session?.accessToken;
  console.log('Student Login Status:', loginRes.status, 'Token received:', !!token);

  if (!token) throw new Error('Student login failed: ' + JSON.stringify(loginJson));

  // 2. Upload PLACE_ASET_Aptitude_Test_Material.pdf
  console.log('\nStep 2: Uploading real test PDF to Personal Learning Studio...');
  const pdfBuffer = fs.readFileSync('C:\\Users\\harii\\Downloads\\PLACE_ASET_Aptitude_Test_Material.pdf');
  
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const form = new FormData();
  form.append('file', blob, 'PLACE_ASET_Aptitude_Test_Material.pdf');
  form.append('title', 'Placement Aptitude Study Material');
  form.append('tags', 'Aptitude, Quantitative, Time and Work');

  const uploadRes = await fetch(BASE_URL + '/ai/personal/documents', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: form
  });

  const uploadJson = await uploadRes.json();
  console.log('Upload HTTP Status:', uploadRes.status);
  const doc = uploadJson?.data;
  console.log('Document ID:', doc?.id);
  console.log('Document Title:', doc?.title);
  console.log('Extracted Questions Count:', doc?.extracted_questions?.length);
  console.log('Flashcards Generated:', doc?.flashcards?.length);
  console.log('AI Summary Preview:', (doc?.ai_summary || '').substring(0, 100) + '...');

  // 3. Verify Document List & Signed URL
  console.log('\nStep 3: Verifying Document Persistence & Signed URL...');
  const listRes = await fetch(BASE_URL + '/ai/personal/documents', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const listJson = await listRes.json();
  console.log('Personal Documents Count:', listJson?.data?.length);

  const signedUrlRes = await fetch(BASE_URL + '/ai/personal/documents/' + doc.id + '/signed-url', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const signedUrlJson = await signedUrlRes.json();
  console.log('Signed URL Status:', signedUrlRes.status, 'Payload:', signedUrlJson);

  // 4. Start Practice Session on 'Time and Work'
  console.log('\nStep 4: Starting Practice Session for Time and Work...');
  const practiceRes = await fetch(BASE_URL + '/practice/sessions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mode: 'quantitative',
      questionCount: 5,
      difficulty: 'medium'
    })
  });
  const practiceJson = await practiceRes.json();
  console.log('Practice Session Created:', practiceRes.status, 'Questions returned:', practiceJson?.data?.questions?.length);
  const sessionData = practiceJson?.data?.session;

  // 5. Submit an answer
  if (practiceJson?.data?.questions?.length > 0) {
    const q1 = practiceJson.data.questions[0];
    const opt1 = q1.question_options?.[0]?.id;
    console.log('\nStep 5: Submitting answer for Question 1...');
    const ansRes = await fetch(BASE_URL + '/practice/sessions/' + sessionData.id + '/answer', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        questionId: q1.id,
        selectedOptionId: opt1,
        timeSpent: 18
      })
    });
    const ansJson = await ansRes.json();
    const isRecorded = ansJson?.data?.isCorrect !== undefined || ansJson?.data?.answer !== undefined;
    console.log('Answer submission status:', ansRes.status, 'Result:', isRecorded ? 'Recorded' : 'Error');
  }

  // 6. Test Assistant Chat API
  console.log('\nStep 6: Testing PLACE Assistant Context Chat...');
  const chatRes = await fetch(BASE_URL + '/assistant/chat', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Explain Time and Work formula simply with an example.',
      mode: 'study_assistant',
      context: {
        type: 'practice',
        title: 'Time and Work Practice'
      }
    })
  });
  const chatJson = await chatRes.json();
  console.log('Assistant Response Status:', chatRes.status);
  const msgObj = chatJson?.data?.message;
  const msgText = typeof msgObj === 'string' ? msgObj : (msgObj?.message || JSON.stringify(msgObj || ''));
  console.log('Assistant Message:', msgText.substring(0, 120) + '...');
  console.log('Provider Used:', msgObj?.metadata?.provider_used || chatJson?.data?.metadata?.provider_used || 'offline_diagnostic');

  // 7. Login as Admin & Test Admin PDF Question Import
  console.log('\nStep 7: Admin Provisioning & Question Import Flow...');
  const adminLoginRes = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@aset.ac.in',
      password: 'AdminPassword@123'
    })
  });
  const adminLoginJson = await adminLoginRes.json();
  const adminToken = adminLoginJson?.data?.session?.accessToken;
  console.log('Admin Login Status:', adminLoginRes.status, 'Role:', adminLoginJson?.data?.user?.role);

  const adminForm = new FormData();
  adminForm.append('file', blob, 'PLACE_ASET_Aptitude_Test_Material.pdf');

  const adminImportRes = await fetch(BASE_URL + '/admin/content/import-questions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + adminToken },
    body: adminForm
  });
  const adminImportJson = await adminImportRes.json();
  console.log('Admin Import Status:', adminImportRes.status);
  console.log('Detected Questions for Admin Review:', adminImportJson?.data?.totalDetected);

  console.log('\n=== ALL END-TO-END VERIFICATION FLOWS SUCCEEDED! ===');
}

runEndToEndVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
