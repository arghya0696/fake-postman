import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

function App() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headers, setHeaders] = useState([{ key: 'Accept', value: 'application/json' }]);
  const [body, setBody] = useState('');

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Copy States for visual feedback
  const [copiedReqBody, setCopiedReqBody] = useState(false);
  const [copiedResBody, setCopiedResBody] = useState(false);
  const [copiedResHeaders, setCopiedResHeaders] = useState(false);
  const [copiedCurlMain, setCopiedCurlMain] = useState(false);
  const [copiedHistoryId, setCopiedHistoryId] = useState(null); // Tracks which history item was copied

  // --- History State ---
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('fake_postman_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

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

  // --- Utilities ---
  const handlePrettify = () => {
    if (!body.trim()) return;
    try {
      const parsedJSON = JSON.parse(body);
      setBody(JSON.stringify(parsedJSON, null, 2));
      setError(null);
    } catch (err) {
      setError("Cannot prettify: Invalid JSON format in Request Body.");
    }
  };

  const handleCopy = (content, setCopiedState) => {
    if (!content) return;
    const textToCopy = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    });
  };

  // --- cURL Generation ---
  const generateCurl = (reqMethod, reqUrl, reqHeaders, reqBody) => {
    let curl = `curl --request ${reqMethod} \\\n  --url '${reqUrl}'`;

    // Add valid headers
    if (reqHeaders && reqHeaders.length > 0) {
      reqHeaders.forEach(h => {
        if (h.key.trim() && h.value.trim()) {
          // Escape single quotes inside the header value safely
          const safeValue = h.value.trim().replace(/'/g, "'\\''");
          curl += ` \\\n  --header '${h.key.trim()}: ${safeValue}'`;
        }
      });
    }

    // Add body if it's not a GET request and body exists
    if (reqBody && reqBody.trim() && reqMethod !== 'GET') {
      const safeBody = reqBody.replace(/'/g, "'\\''");
      curl += ` \\\n  --data '${safeBody}'`;
    }

    return curl;
  };

  const handleCopyCurlMain = () => {
    const curlStr = generateCurl(method, url, headers, body);
    navigator.clipboard.writeText(curlStr).then(() => {
      setCopiedCurlMain(true);
      setTimeout(() => setCopiedCurlMain(false), 2000);
    });
  };

  const handleCopyCurlHistory = (e, item) => {
    e.stopPropagation(); // Prevents loading the history item into the editor
    const curlStr = generateCurl(item.method, item.url, item.headers, item.body);
    navigator.clipboard.writeText(curlStr).then(() => {
      setCopiedHistoryId(item.id);
      setTimeout(() => setCopiedHistoryId(null), 2000);
    });
  };

  // --- History Management ---
  const saveToHistory = () => {
    const newEntry = {
      id: Date.now(),
      method,
      url,
      headers,
      body,
    };

    const updatedHistory = [newEntry, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('fake_postman_history', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (item) => {
    setMethod(item.method);
    setUrl(item.url);
    setHeaders(item.headers || [{ key: '', value: '' }]);
    setBody(item.body || '');
    setResponse(null);
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('fake_postman_history');
  };

  // --- API Execution ---
  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

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
      saveToHistory();

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

      {/* --- Top Bar --- */}
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
        {/* New Copy cURL Button for Main Editor */}
        <button onClick={handleCopyCurlMain} className="curl-main-btn" title="Copy as cURL">
          {copiedCurlMain ? '✅ cURL Copied' : '📋 cURL'}
        </button>
        <button onClick={handleSend} disabled={loading} className="send-btn">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="main-content">

        {/* --- History Sidebar --- */}
        <div className="history-sidebar">
          <div className="history-header">
            <h3>History</h3>
            {history.length > 0 && (
              <button onClick={clearHistory} className="clear-history-btn">Clear</button>
            )}
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-history">No history yet.</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="history-item" onClick={() => loadFromHistory(item)}>
                  <div className="history-item-content">
                    <span className={`hist-method method-${item.method}`}>{item.method}</span>
                    <span className="hist-url" title={item.url}>{item.url}</span>
                  </div>
                  {/* New Copy cURL Button for History Item */}
                  <button
                    className="hist-copy-btn"
                    onClick={(e) => handleCopyCurlHistory(e, item)}
                    title="Copy cURL"
                  >
                    {copiedHistoryId === item.id ? '✅' : '📋'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="request-pane">
          {/* --- HEADERS SECTION --- */}
          <h3>Request Headers</h3>
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
                <button onClick={() => removeHeaderRow(index)} className="remove-btn" title="Remove Header">✕</button>
              </div>
            ))}
            <button onClick={addHeaderRow} className="add-btn">+ Add Header</button>
          </div>

          {/* --- BODY SECTION --- */}
          <div className="section-header">
            <h3>Request Body (JSON)</h3>
            <div className="action-buttons">
              <button onClick={handlePrettify} className="action-btn">✨ Prettify</button>
              <button onClick={() => handleCopy(body, setCopiedReqBody)} className="action-btn">
                {copiedReqBody ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
            className="body-textarea"
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

              {/* Response Body */}
              <div className="response-section-header">
                <h4>Body</h4>
                <button onClick={() => handleCopy(response.body, setCopiedResBody)} className="action-btn">
                  {copiedResBody ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{ borderRadius: '6px', margin: 0, border: '1px solid #555', background: '#1e1e1e' }}
              >
                {JSON.stringify(response.body, null, 2)}
              </SyntaxHighlighter>

              {/* Response Headers */}
              <div className="response-section-header">
                <h4>Headers</h4>
                <button onClick={() => handleCopy(response.headers, setCopiedResHeaders)} className="action-btn">
                  {copiedResHeaders ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
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