import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

function App() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');

  // 1. Change headers state to an array of key-value objects
  const [headers, setHeaders] = useState([{ key: 'Accept', value: 'application/json' }]);
  const [body, setBody] = useState('');

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Header Management Functions ---
  const handleHeaderChange = (index, field, newValue) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index][field] = newValue;
    setHeaders(updatedHeaders);
  };

  const addHeaderRow = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeaderRow = (index) => {
    const updatedHeaders = headers.filter((_, i) => i !== index);
    setHeaders(updatedHeaders);
  };
  // -----------------------------------

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    // 2. Convert header rows array back into a standard object
    let parsedHeaders = {};
    headers.forEach(h => {
      if (h.key.trim() !== '') {
        parsedHeaders[h.key.trim()] = h.value.trim();
      }
    });

    let parsedBody = null;
    try {
      if (body.trim()) parsedBody = JSON.parse(body);
    } catch (err) {
      setError("Invalid JSON format in Request Body.");
      setLoading(false);
      return;
    }

    const apiRequest = {
      url: url,
      method: method,
      headers: Object.keys(parsedHeaders).length > 0 ? parsedHeaders : null,
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
        <div className="request-pane">
          <h3>Request Headers</h3>

          {/* 3. Render dynamic rows for headers */}
          <div className="headers-container">
            {headers.map((header, index) => (
              <div key={index} className="kv-row">
                <input
                  type="text"
                  placeholder="Key (e.g., Authorization)"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  className="kv-input"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., Bearer token)"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  className="kv-input"
                />
                <button onClick={() => removeHeaderRow(index)} className="remove-btn" title="Remove Header">
                  ✕
                </button>
              </div>
            ))}
            <button onClick={addHeaderRow} className="add-btn">+ Add Header</button>
          </div>

          <h3>Request Body (JSON)</h3>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
          />
        </div>

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
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{ borderRadius: '6px', margin: 0, border: '1px solid #555', background: '#1e1e1e' }}
              >
                {JSON.stringify(response.body, null, 2)}
              </SyntaxHighlighter>

              <h4>Headers</h4>
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{ borderRadius: '6px', margin: 0, border: '1px solid #555', background: '#1e1e1e' }}
              >
                {JSON.stringify(response.headers, null, 2)}
              </SyntaxHighlighter>
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