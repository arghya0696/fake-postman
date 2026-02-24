import { useState } from 'react';
import './App.css'; // We'll add some basic styles next

function App() {
  // Request State
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headers, setHeaders] = useState('{\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState('');

  // Response State
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    // Parse headers and body from string to JSON objects
    let parsedHeaders = null;
    let parsedBody = null;

    try {
      if (headers.trim()) parsedHeaders = JSON.parse(headers);
      if (body.trim()) parsedBody = JSON.parse(body);
    } catch (err) {
      setError("Invalid JSON format in Headers or Body input.");
      setLoading(false);
      return;
    }

    // Build the ApiRequest payload
    const apiRequest = {
      url: url,
      method: method,
      headers: parsedHeaders,
      body: parsedBody
    };

    try {
      const res = await fetch('/api/proxy/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequest)
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError("Failed to connect to the backend proxy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🚀 Fake Postman</h1>
      </header>

      {/* Top Bar: Method, URL, Send Button */}
      <div className="url-bar">
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="method-select">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
          placeholder="Enter request URL"
        />
        <button onClick={handleSend} disabled={loading} className="send-btn">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="main-content">
        {/* Left Side: Request Config */}
        <div className="request-pane">
          <h3>Request Headers (JSON)</h3>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder='{"Authorization": "Bearer token"}'
          />

          <h3>Request Body (JSON)</h3>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
          />
        </div>

        {/* Right Side: Response View */}
        <div className="response-pane">
          <h3>Response</h3>
          {error && <div className="error-box">{error}</div>}

          {response && (
            <div className="response-details">
              <div className="status-bar">
                Status: <span className={response.statusCode < 400 ? 'status-ok' : 'status-err'}>
                  {response.statusCode}
                </span>
              </div>

              <h4>Body</h4>
              <pre className="response-box">
                {JSON.stringify(response.body, null, 2)}
              </pre>

              <h4>Headers</h4>
              <pre className="response-box">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            </div>
          )}
          {!response && !error && !loading && (
            <div className="empty-state">Enter a URL and click Send to get a response.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;