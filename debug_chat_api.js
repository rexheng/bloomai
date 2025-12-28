
// Remove require if Node 18+
// const fetch = require('node-fetch');

async function testChatApi() {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Debug Test Message' }],
        // conversationId: '...' 
      })
    });

    console.log('Status:', response.status);
    
    if (!response.ok) {
        const text = await response.text();
        console.log('Error Body:', text);
    } else {
        console.log('Success (Stream started)');
    }

  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testChatApi();
